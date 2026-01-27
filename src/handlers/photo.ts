/**
 * Photo message handler for Claude Telegram Bot.
 *
 * Supports single photos and media groups (albums) with 1s buffering.
 * Uses Zhipu AI (GLM) API for image analysis, then passes results to Claude session.
 */

import type { Context } from "grammy";
import { session } from "../session";
import { ALLOWED_USERS, TEMP_DIR, ZHIPU_API_KEY } from "../config";
import { isAuthorized, rateLimiter } from "../security";
import { auditLog, auditLogRateLimit, startTypingIndicator } from "../utils";
import { StreamingState, createStatusCallback } from "./streaming";
import { createMediaGroupBuffer, handleProcessingError } from "./media-group";

// Constants
const DEFAULT_IMAGE_PROMPT = "详细描述这张图片中的可见内容。";
const GLM_MODEL = "glm-4.6v";
const ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

// Create photo-specific media group buffer
const photoBuffer = createMediaGroupBuffer({
  emoji: "📷",
  itemLabel: "photo",
  itemLabelPlural: "photos",
});

/**
 * Download a photo and return the local path.
 */
async function downloadPhoto(ctx: Context): Promise<string> {
  const photos = ctx.message?.photo;
  if (!photos || photos.length === 0) {
    throw new Error("No photo in message");
  }

  const file = await ctx.getFile();

  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  const photoPath = `${TEMP_DIR}/photo_${timestamp}_${random}.jpg`;

  const response = await fetch(
    `https://api.telegram.org/file/bot${ctx.api.token}/${file.file_path}`
  );
  const buffer = await response.arrayBuffer();
  await Bun.write(photoPath, buffer);

  return photoPath;
}

/**
 * Get MIME type from file extension.
 */
function getMimeType(filePath: string): string {
  const ext = filePath.toLowerCase().split(".").pop();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp",
    tiff: "image/tiff",
    tif: "image/tiff",
  };
  return mimeTypes[ext || ""] || "image/jpeg";
}

/**
 * Analyze image using Zhipu AI API (GLM-4.6V).
 */
async function analyzeImageWithZhipu(
  imagePath: string,
  prompt?: string
): Promise<string> {
  const effectivePrompt = prompt || DEFAULT_IMAGE_PROMPT;
  if (!ZHIPU_API_KEY) {
    throw new Error("ZHIPU_API_KEY environment variable is not set");
  }

  console.log(`[Zhipu] 开始分析图片: ${imagePath}`);
  console.log(`[Zhipu] 使用模型: ${GLM_MODEL}`);
  console.log(`[Zhipu] Prompt: ${effectivePrompt}`);

  const imageBuffer = await Bun.file(imagePath).arrayBuffer();
  const base64 = btoa(
    new Uint8Array(imageBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );
  const mimeType = getMimeType(imagePath);
  const dataUrl = `data:${mimeType};base64,${base64}`;

  console.log(`[Zhipu] 发送 API 请求...`);

  const response = await fetch(ZHIPU_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ZHIPU_API_KEY}`,
    },
    body: JSON.stringify({
      model: GLM_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: effectivePrompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  console.log(`[Zhipu] API 响应状态: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Zhipu] API 错误: ${response.status}`, errorText);
    throw new Error(`图片分析失败 (${response.status})`);
  }

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string; reasoning_content?: string } }>;
    error?: { message?: string };
  };

  console.log(`[Zhipu] API 返回原始内容:`, JSON.stringify(result, null, 2));

  if (result.error?.message) {
    console.error(`[Zhipu] API 错误: ${result.error.message}`);
    throw new Error(`API 错误: ${result.error.message}`);
  }

  const choice = result.choices?.[0];
  const message = choice?.message;
  const content = message?.content || message?.reasoning_content;
  if (content) {
    console.log(`[Zhipu] 图片分析完成, 结果长度: ${content.length} 字符`);
    return content;
  }

  throw new Error("图片分析响应内容为空");
}

/**
 * Process photos: analyze with API, then send to Claude session.
 */
async function processPhotos(
  ctx: Context,
  photoPaths: string[],
  caption: string | undefined,
  userId: number,
  username: string,
  chatId: number
): Promise<void> {
  // Mark processing started
  const stopProcessing = session.startProcessing();

  // Build prompt for Claude
  let prompt: string;
  if (photoPaths.length === 1) {
    prompt = caption
      ? `[Photo: ${photoPaths[0]}]\n\n${caption}`
      : `Please analyze this image: ${photoPaths[0]}`;
  } else {
    const pathsList = photoPaths.map((p, i) => `${i + 1}. ${p}`).join("\n");
    prompt = caption
      ? `[Photos:\n${pathsList}]\n\n${caption}`
      : `Please analyze these ${photoPaths.length} images:\n${pathsList}`;
  }

  // Set conversation title (if new session)
  if (!session.isActive) {
    const rawTitle = caption || "[Foto]";
    const title = rawTitle.length > 50 ? rawTitle.slice(0, 47) + "..." : rawTitle;
    session.conversationTitle = title;
  }

  const typing = startTypingIndicator(ctx);

  // Create streaming state
  const state = new StreamingState();
  const statusCallback = createStatusCallback(ctx, state);

  try {
    // First, analyze images with Zhipu API
    const imageDescriptions: string[] = [];
    const userPrompt = caption || DEFAULT_IMAGE_PROMPT;

    for (let i = 0; i < photoPaths.length; i++) {
      const promptText: string =
        photoPaths.length === 1
          ? userPrompt
          : `第 ${i + 1} 张图片：${userPrompt}`;
      const description = await analyzeImageWithZhipu(
        photoPaths[i] as string,
        promptText
      );
      imageDescriptions.push(
        `**图片 ${i + 1}** (${photoPaths[i]})\n${description}`
      );
    }

    // Combine image descriptions with user's caption (if any)
    const combinedPrompt =
      imageDescriptions.join("\n\n---\n\n") +
      (caption ? `\n\n用户附加说明：${caption}` : "");

    // Send to Claude session for continued conversation
    const response = await session.sendMessageStreaming(
      combinedPrompt,
      username,
      userId,
      statusCallback,
      chatId,
      ctx
    );

    await auditLog(userId, username, "PHOTO", prompt, response);
  } catch (error) {
    await handleProcessingError(ctx, error, state.toolMessages);
  } finally {
    stopProcessing();
    typing.stop();
    // Clean up downloaded files
    for (const path of photoPaths) {
      try {
        await Bun.file(path).delete();
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Handle incoming photo messages.
 */
export async function handlePhoto(ctx: Context): Promise<void> {
  const userId = ctx.from?.id;
  const username = ctx.from?.username || "unknown";
  const chatId = ctx.chat?.id;
  const mediaGroupId = ctx.message?.media_group_id;

  if (!userId || !chatId) {
    return;
  }

  // 1. Authorization check
  if (!isAuthorized(userId, ALLOWED_USERS)) {
    await ctx.reply("Unauthorized. Contact the bot owner for access.");
    return;
  }

  // 2. For single photos, show status and rate limit early
  let statusMsg: Awaited<ReturnType<typeof ctx.reply>> | null = null;
  if (!mediaGroupId) {
    console.log(`Received photo from @${username}`);
    // Rate limit
    const [allowed, retryAfter] = rateLimiter.check(userId);
    if (!allowed) {
      await auditLogRateLimit(userId, username, retryAfter!);
      await ctx.reply(
        `⏳ Rate limited. Please wait ${retryAfter!.toFixed(1)} seconds.`
      );
      return;
    }

    // Show status immediately
    statusMsg = await ctx.reply("📷 Processing image...");
  }

  // 3. Download photo
  let photoPath: string;
  try {
    photoPath = await downloadPhoto(ctx);
  } catch (error) {
    console.error("Failed to download photo:", error);
    if (statusMsg) {
      try {
        await ctx.api.editMessageText(
          statusMsg.chat.id,
          statusMsg.message_id,
          "❌ Failed to download photo."
        );
      } catch (editError) {
        console.debug("Failed to edit status message:", editError);
        await ctx.reply("❌ Failed to download photo.");
      }
    } else {
      await ctx.reply("❌ Failed to download photo.");
    }
    return;
  }

  // 4. Single photo - process immediately
  if (!mediaGroupId && statusMsg) {
    await processPhotos(
      ctx,
      [photoPath],
      ctx.message?.caption,
      userId,
      username,
      chatId
    );

    // Clean up status message
    try {
      await ctx.api.deleteMessage(statusMsg.chat.id, statusMsg.message_id);
    } catch (error) {
      console.debug("Failed to delete status message:", error);
    }
    return;
  }

  // 5. Media group - buffer with timeout
  if (!mediaGroupId) return; // TypeScript guard

  await photoBuffer.addToGroup(
    mediaGroupId,
    photoPath,
    ctx,
    userId,
    username,
    processPhotos
  );
}
