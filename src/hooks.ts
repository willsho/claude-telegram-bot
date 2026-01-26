/**
 * Agent SDK hooks for Claude Telegram Bot.
 *
 * SessionStart hook injects the working directory file tree before Claude
 * starts working, giving it a map of the codebase structure upfront.
 */

import type {
  HookCallback,
  HookCallbackMatcher,
  SessionStartHookInput,
} from "@anthropic-ai/claude-agent-sdk";
import { WORKING_DIR } from "./config";

// Hooks configuration type matching SDK's Options['hooks']
export type HooksConfig = Partial<
  Record<
    | "SessionStart"
    | "PreToolUse"
    | "PostToolUse"
    | "PostToolUseFailure"
    | "Notification"
    | "UserPromptSubmit"
    | "SessionEnd"
    | "Stop"
    | "SubagentStart"
    | "SubagentStop"
    | "PreCompact"
    | "PermissionRequest",
    HookCallbackMatcher[]
  >
>;

/**
 * Build a file tree using the `tree` command.
 * Falls back to a simple glob-based listing if tree is not available.
 */
async function buildFileTreeString(cwd: string): Promise<string> {
  try {
    // Try using the tree command with common ignore patterns
    const proc = Bun.spawn(
      [
        "tree",
        "-L",
        "3",
        "-a",
        "-I",
        ".git|node_modules|.obsidian|__pycache__|.venv|dist|build",
        "--noreport",
      ],
      {
        cwd,
        stdout: "pipe",
        stderr: "pipe",
      }
    );

    const output = await new Response(proc.stdout).text();
    const exitCode = await proc.exited;

    if (exitCode === 0 && output.trim()) {
      return output.trim();
    }
  } catch {
    // tree command not available, fall back to glob
  }

  // Fallback: use Bun's glob to list files
  try {
    const entries = await Array.fromAsync(
      new Bun.Glob("**/*").scan({
        cwd,
        dot: true,
        onlyFiles: false,
      })
    );

    // Filter out common ignore patterns
    const ignorePatterns = [
      /^\.git\//,
      /^node_modules\//,
      /^\.obsidian\//,
      /^__pycache__\//,
      /^\.venv\//,
      /^dist\//,
      /^build\//,
    ];

    const filtered = entries
      .filter((entry) => !ignorePatterns.some((p) => p.test(entry)))
      .sort()
      .slice(0, 200); // Limit to prevent huge outputs

    return filtered.join("\n");
  } catch (error) {
    return `[Error building file tree: ${error}]`;
  }
}

/**
 * SessionStart hook that injects the working directory file tree.
 * This gives Claude a map of the codebase before it starts exploring.
 */
const injectFileTree: HookCallback = async (input, _toolUseId, _context) => {
  // Only run for SessionStart events
  if (input.hook_event_name !== "SessionStart") {
    return {};
  }

  const sessionInput = input as SessionStartHookInput;

  // Only inject file tree on new sessions, not resumes
  // (on resume, Claude already has context from the previous session)
  if (sessionInput.source === "resume") {
    console.log("[Hook] SessionStart: skipping file tree for resumed session");
    return {};
  }

  console.log(`[Hook] SessionStart: building file tree for ${WORKING_DIR}`);

  const fileTree = await buildFileTreeString(WORKING_DIR);

  return {
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: `Working directory structure:\n\`\`\`\n${fileTree}\n\`\`\``,
    },
  };
};

/**
 * Hooks configuration to pass to the Agent SDK query().
 */
export const HOOKS_CONFIG: HooksConfig = {
  SessionStart: [
    {
      hooks: [injectFileTree],
      timeout: 10, // 10 seconds should be plenty for tree command
    },
  ],
};
