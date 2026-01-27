# Claude Code 作为个人助理

背景介绍：我是 [Fabrizio](https://fabrizio.so)，[@linuz90 (X)](https://x.com/linuz90)，[Typefully](https://typefully.com) 的联合创始人兼设计师。

在 Typefully，我们很早就全面拥抱 AI 编程，我们大量使用 Claude Code 和 Codex。但我也喜欢优化和自动化我的个人生活。

尤其是自从 Sonnet/Opus 4.5 模型推出后，[Claude Code](https://claude.com/product/claude-code) 已经成为了我首选的 AI 编程助手。

我很快意识到，这些模型在获得正确的指令、上下文和工具后，实际上是非常强大的**通用代理**。

看到我的联合创始人 [Francesco](https://x.com/frankdilo) 使用 Claude Code 处理任务和邮件后，我开始**将它作为个人助理使用，尤其是通过 Telegram**（这就是本项目的主题）。

经过一些迭代，我形成了这个系统/设置：

1. **我创建了一个 `fab-dev` 文件夹**，其中包含一个 `CLAUDE.md`，用于向 Claude 介绍我、我的偏好、我的笔记位置、我的工作流程。
2. _可选_：我要求 Claude**[符号链接](https://en.wikipedia.org/wiki/Symbolic_link)配置文件**到这个新的中心文件夹，这样我可以轻松编辑它们并改进我的开发环境。例如，我将 `~/.claude/commands` 和 `~/.claude/skills` 符号链接到这里，这样我可以要求 Claude 添加新的命令或技能，它们将在任何地方可用。我还将 `~/.zshrc` 符号链接到这个文件夹用于 shell 配置。
3. _可选_：**我将此文件夹作为 Git 仓库进行管理**，这样我也可以轻松地对其进行版本控制，或者将来如果需要可以在多台 Mac 上共享。
4. **我将此 "fab-dev" 文件夹设置为该机器人的工作目录**（通过 `CLAUDE_WORKING_DIR`）。

**为了保持 CLAUDE.md 简洁**，我在其中引用了我的个人笔记系统，而不是直接嵌入所有内容。

`CLAUDE.md` 中引用的主要"笔记"文件夹是一个 iCloud 文件夹，我将其添加到了 [Ulysses](https://ulysses.app/) 和 [iA Writer](https://ia.net/writer)，这样我可以看到助理所做的更改，无论我在哪里。iCloud 在这方面非常出色，会在后台将更新实时推送到所有设备。

此外，我通过安装 [MCPs](https://code.claude.com/docs/en/mcp)、添加[命令](https://code.claude.com/docs/en/slash-commands)和[技能](https://code.claude.com/docs/en/skills)来扩展其功能。技能特别强大——它们会根据上下文自动触发，并为常见任务定义特定的工作流程，如创建待办事项、研究主题或规划健身。

**神奇之处在于：当我需要新功能时，我只需要求 Claude 构建它。** 即使通过 Telegram 机器人，在旅途中也能做到。

例如，我希望助理能够总结视频，所以我要求它创建获取 YouTube 字幕的脚本（并回退到本地下载和转录）。现在我可以通过 Telegram 从任何地方请求视频摘要。

![视频摘要示例](../assets/demo-video-summary.gif)

因此，无论我是在 Mac 上启动 Claude Code 会话（通常带有 `--dangerously-skip-permissions` 标志）还是与 Telegram 机器人聊天，**Claude 现在是我的 24/7 执行助理**。

## CLAUDE.md 是助理的大脑

我个人助理 `fab-dev` 文件夹中的 `CLAUDE.md` 文件是设置的核心。

由于 Claude 默认以绕过提示权限的方式运行（在 [SECURITY.md](../SECURITY.md) 中有更多说明），它可以浏览其他文件夹、读写文件，并在允许的路径内相当自由地执行命令（关于脚本和命令的更多信息见下文）。

以下是基于我自己的设置模板：

````
# CLAUDE.md

此文件为 Claude Code 提供指导，使其能够作为 [你的名字] 的个人助理。

## 快速参考

**此文件夹：**
- `cli/` - 实用脚本（使用 `bun run cli/...` 运行）
- `.claude/skills/` - 任务工作流程（things-todo、gmail、research、workout-planning 等）
- `.claude/agents/` - 用于 pulse 和 digests 的子代理

**关键路径：**
- 笔记：`~/Documents/Notes/`（Me/、Research/、Health/、Journal/、[爱好]/）
- 个人文档：`~/Documents/Personal/`

## 关于 [你的名字]

[你的名字] 是一名 [年龄] 岁的 [职业]，居住在 [城市]。

[关于工作、生活方式、爱好等的简要背景]

关于个人背景、目标和财务状况——请参阅下面的 Me/ 文件。

**保持上下文新鲜**：当出现新的个人信息时，主动更新相关的 Me/ 笔记。

## 如何协助

- **选择正确的来源**：自主决定去哪里查找。需要时并行搜索多个来源（网络、笔记、reddit 等）
- **始终检查日期**：对于时间敏感的问题，先运行 `date`
- **沟通风格**：[例如，"平衡且友好，少用 emoji"]
- **自主性**：独立处理常规任务，在重要操作前询问
- **格式**：优先使用项目符号列表而非 markdown 表格
- **优先级**：突出显示重要项目，不要只是倾倒列表

**关键**：当被要求记住某些内容时，更新相关文件：
- 个人目标 → `life-goals.md`
- 个人背景 → `personal-context.md`
- Claude 行为 → `CLAUDE.md`

# 知识和文件

笔记存储在 `~/Documents/Notes/`（同步到 iCloud）。使用 `qmd` 进行语义搜索：

    qmd search "关键词"   # 快速关键词匹配
    qmd query "问题"      # LLM 重新排序（最佳质量）

## 个人背景 (Me/)

权威文件：
- `personal-context.md` — 家庭、朋友、偏好、习惯
- `life-goals.md` — 长期目标
- `pulse.md` — 当前生活摘要
- `finances.md` — 财务概览

## 其他文件夹

- `Journal/` — 按年份的月度条目
- `Health/` — 饮食、锻炼、训练计划
- `Research/` — 研究笔记
- `[爱好]/` — 爱好特定笔记

## 快速查找

- 生活/优先级 → `Me/pulse.md` + 最近的 Journal
- 目标 → `Me/life-goals.md`
- 锻炼 → `Health/` 或 `bun run cli/utils/health.ts workouts week`

# 任务管理

## 任务

使用 `things-todo` 技能进行任务创建、安排和项目路由。

**当被问及"我今天有什么任务"时**：检查任务和日历。

## 日历

    bun run cli/google/calendar.ts today|tomorrow|week|range <from> <to>

## 邮件

使用 `gmail` 技能处理邮件和邮件到任务的工作流程。

## 工作集成（可选）

    bun run cli/integrations/slack.ts channels|messages|recent
    bun run cli/integrations/notion.ts search|page|databases

````

_"保持上下文新鲜"_ 的指令创建了一种**基于文件的记忆系统**，因为 Claude 会自动读取和更新上下文文件（笔记），因为它会了解到关于我的新信息。

我偶尔也会要求 Claude 检查我的笔记文件夹、Things 项目等，并更新 `CLAUDE.md` 文件以获取最新信息，因此在那边硬编码一些信息是可以的，因为它很容易自我更新。

## 示例：Claude 作为私人教练/健康教练

这个设置我最喜欢的用途之一是让 Claude 充当私人教练，它了解我的饮食、我的训练计划和我最近的活动。

我在 Mac 上录制了演示，但这通常是我在旅途中用 iPhone 做的：

![锻炼示例](../assets/demo-workout.gif)

设置很简单：

1. **[Health Auto Export](https://www.healthyapps.dev/)** — 一个将 Apple Health 数据同步到 iCloud 作为每日 JSON 文件的 iOS 应用
2. **一个 CLI 脚本**（`cli/utils/health.ts`）读取这些文件并返回结构化的健康数据——你可以相当容易地要求 Claude 构建这类脚本
3. **一个 `workout-planning` 技能**，定义了基于训练计划和最近活动创建锻炼的工作流程
4. **一个 Notes 文件夹**（通过 iCloud 同步），锻炼日志以 markdown 形式保存

我要求 Claude 创建健康脚本，它解析 Health Auto Export 的 JSON 文件并返回我当前的健康指标以及用于比较的历史趋势。

它返回的内容如下：

```json
{
  "current": {
    "sleep": {
      "duration": "8h 6m",
      "deep": "2h 4m",
      "rem": "2h 4m",
      "bedtime": "1:18 AM",
      "wakeTime": "9:27 AM"
    },
    "activity": {
      "steps": 6599,
      "distance": "5.1km",
      "activeCalories": 582,
      "exerciseTime": 20
    },
    "vitals": {
      "restingHR": 48,
      "hrv": 70.6,
      "avgHR": 61
    }
  },
  "trends": {
    "last7days": { "avgSleep": "7h 40m", "avgRestingHR": 56.6, "avgHRV": 68.8 },
    "30daysAgo": { "avgSleep": "7h 21m", "avgRestingHR": 55.1, "avgHRV": 66.4 },
    "3monthsAgo": { "avgSleep": "7h 29m", "avgRestingHR": 51.3, "avgHRV": 77.5 }
  },
  "recovery": {
    "score": 80,
    "status": "optimal"
  }
}
```

现在我可以随时随地询问"我睡得怎么样？"或"我的恢复状况如何？"

我不再将锻炼说明嵌入 CLAUDE.md，而是使用一个 **`workout-planning` 技能**（`.claude/skills/workout-planning/SKILL.md`）：

```markdown
---
name: workout-planning
description: 基于训练计划和最近活动创建个性化的锻炼计划。当被要求锻炼、锻炼常规、健身房计划或"我今天应该练什么"时使用。
allowed-tools: Read, Write, Bash(cli/utils/health.ts workouts:*), Glob
---

# 锻炼规划

当被要求锻炼时：

1. **阅读训练计划**：`~/Documents/Notes/Health/training.md`（PT 计划）
2. **检查最近的日志**：`~/Documents/Notes/Health/Workouts/`
3. **检查锻炼频率**：运行 `health.ts workouts week` 查看最近 7 天
4. **根据计划和最近的活动提出适当的锻炼**
5. **立即创建**锻炼文件：`Health/Workouts/YYYY-MM-DD-workout.md`
```

该技能还包括一个用于检查锻炼历史的 CLI：

```bash
bun run cli/utils/health.ts workouts           # 今天的锻炼
bun run cli/utils/health.ts workouts week      # 最近 7 天
bun run cli/utils/health.ts workouts enrich    # 将健康数据添加到今天的日志
```

当我发送"给我一个锻炼"时，Claude：

1. 从我的 PT 检查我的训练计划
2. 查看我最近锻炼做了什么
3. 考虑我来自健康脚本的恢复分数
4. 创建一个像这样的锻炼日志文件：

```markdown
# 锻炼 - 2025年12月29日

**类型：** 全身
**地点：** 健身房

## 锻炼项目

3 组，10-12 次，休息 1 分钟

1. **腿伸展** - [视频](https://youtu.be/...)
2. **腿弯举** - [视频](https://youtu.be/...)
3. **高位下拉** - [视频](https://youtu.be/...)
4. **肩推** - [视频](https://youtu.be/...)
5. **三头肌下压 + 二头肌弯举**

## 备注

度假期间的轻松锻炼，约 45-50 分钟。
```

由于我的笔记文件夹通过 iCloud 同步，我在健身房打开 [Ulysses](https://ulysses.app/) 时，锻炼就在那里。

我可以中途给 Claude 发送消息要求调整，比如"把肩推换成侧平举"，文件会更新。我在几秒钟内就在 Ulysses 中看到变化。

这就像口袋里有一个私人教练，他了解我的训练历史、我的恢复状态，并且可以随时调整。

和往常一样，上下文越好，结果越好。所以如果你有训练计划或训练历史，请确保这些笔记对 Claude 可用。

## 示例：带有子代理的 Life Pulse 命令

[命令](https://code.claude.com/docs/en/slash-commands) 允许你定义可重用的提示，带有动态上下文。它们位于 `~/.claude/commands/`（全局）或 `your-project/claude/commands/`。

另一方面，[子代理](https://code.claude.com/docs/en/sub-agents) 是专门的代理，Claude 可以将任务委托给它们。它们在 `.claude/agents/` 中定义为 markdown 文件，每个都在自己的上下文窗口中运行，这使主对话保持精简。

我的个人助理 "fab-dev" 文件夹包含命令和子代理。命令从 `~/.claude/commands/` 符号链接，因此它们在任何地方都可用，并且它们可以使用 MCP 并调用此文件夹中定义的子代理。

我一直喜欢每天早上阅读某种**执行摘要，了解我当天要做什么**的想法，所以我要求 Claude 创建一个 `/life-pulse` 命令，带有一组专门的子代理，并设置它每天早上自动运行。

### 为什么使用子代理？

像 `/life-pulse` 这样的复杂命令需要从许多来源收集数据：邮件、工作问题、财务、健康指标、赛车统计、网络新闻。如果主代理直接完成所有这些，上下文窗口会很快被原始数据填满，可能导致结果不佳或遗漏信息。*

所以我的 pulse 命令使用 **6 个并行运行的子代理**：

| 子代理              | 任务                               | 返回内容                                    |
| ------------------- | ---------------------------------- | ----------------------------------------- |
| `gmail-digest`      | 分析收件箱和最近的邮件             | 需要注意的未读邮件、订单、邮件线索         |
| `linear-digest`     | 分析工作问题                       | 进行中的任务、阻塞、下一个                 |
| `finance-digest`    | 分析净资产和配置                   | 财务快照、时间敏感项目                     |
| `health-digest`     | 分析 Apple Health 数据             | 简要健康检查                               |
| `sim-racing-digest` | 分析比赛结果                       | 性能洞察                                   |
| `for-you-digest`    | 策划网络和 Reddit 内容             | 10-15 个有趣的项目                         |

主代理只处理轻量级数据（Things 任务、日历、日记）并**组装**子代理输出为最终的摘要。

### 子代理示例

这是一个摘要子代理的样子（简化版）：

```
---
name: health-digest
description: 分析健康指标并提供简要检查。用于 pulse 或当用户询问健康时。
tools: Bash, Read
model: haiku
---

你是一个关心健康的朋友，对健康指标进行快速检查。

## 数据收集

运行健康脚本：
bun run cli/utils/health.ts

## 分析

寻找真正值得注意的内容：

- 睡眠明显比平时好/差
- 静息心率上升（压力）或下降（健身）
- 过去一个月的 HRV 变化

## 输出

返回简要检查（3-5 行）。像朋友一样写，而不是像医学报告。

示例："睡眠一直不错，7.2 小时——比上个月的 6.8 小时有所增加。静息心率保持在 54 bpm。本周活动有点少，可能想多走走。"
```

### 主要的 Pulse 命令

这是 `/life-pulse` 命令的简化版本：

````
---
description: 生成执行生活摘要
allowed-tools: Bash, Read, Write, mcp__things__*, Task
---

# 生成生活脉冲

## 上下文

- 当前时间：!`date "+%A, %Y-%m-%d %H:%M"`

## 实现

1. **收集数据**（并行运行）：

- Things：`get_today`、`get_upcoming`、`get_projects`（轻量级，主代理处理）
- 日历：`bun run cli/google/calendar.ts range <today> <today+28>`
- 日记：阅读 2-3 个最近的条目
- **邮件**：调用 `gmail-digest` 子代理（不要在后台运行）
- **工作**：调用 `linear-digest` 子代理（不要在后台运行）
- **财务**：调用 `finance-digest` 子代理（不要在后台运行）
- **健康**：调用 `health-digest` 子代理（不要在后台运行）
- **赛车**：调用 `sim-racing-digest` 子代理（不要在后台运行）
- **为你**：调用 `for-you-digest` 子代理（不要在后台运行）

2. **综合**输出为各个部分：

- **TL;DR**：项目符号点（每个最多 400 个字符），捕捉生活的基本状态。每个项目符号以相关的 emoji 开头。包括财务快照、邮件亮点、即将到来的事件。
  - 对于有明确下一步操作的项目，添加跟进行：
    ```
    💰 **项目描述在这里**
    ↳ **明确的下一步操作在这里**
    ```
- **现在**：需要关注的事项列表。最多 3-6 项，不啰嗦。
- **为你**：来自 for-you-digest 的策划内容。带有 emoji 和链接的简要项目符号。
- **心事**：什么占据了心理带宽。每段以 emoji 开头。
- **健康**：来自 health-digest。可以是项目符号，每个都有相关的 emoji。
- **下一步**：近期优先事项与长期目标的结合。

3. **格式规则**：
- NO 表格——使用自然散文和项目符号
- 使用**粗体**强调关键术语
- 保持可扫描但温暖，像个人简报
- 使链接可点击（Linear 问题、Things 任务、邮件）

4. **写入**到 `~/Documents/Notes/life-pulse.md`

5. 完成后打开文件：`open ~/Documents/Notes/life-pulse.md`
````

所有原始数据都保留在快速且廉价的子代理运行中（它们使用 `haiku`）。主代理只看到综合摘要并将所有内容组装成一个连贯、可读的摘要。

而且由于每个子代理都是一个独立文件，我可以直接调用它们来回答"我的健康状况如何？"或"检查我的邮件"等问题。

我已经在早上喝咖啡时在 iPad 上阅读我的生活脉冲摘要一段时间了，这是开始新的一天的好方法。

## 示例：动态日历

我使用的另一个很酷的模式是让 Claude**管理同步到我的日历的日历**。我将这个用于现实世界的赛道日和模拟赛车联赛。

```
YAML 配置 → sync.py → .ics 文件 → GitHub Gist → Google/Apple 日历
```

[GitHub Gist](https://gist.github.com/) URL 是稳定的，因此订阅它们的日历应用会在内容更改时自动刷新（有一些延迟）。

我想了解我附近赛道（葡萄牙的 Estoril、Portimão）的赛道日。问题是：活动信息分散在多个组织者的网站上，通常在 PDF 传单或基于图片的页面上。

所以我要求 Claude 构建一个爬虫。它发展成一个 36,000 行的 Python 脚本（`racing-events.py`）：

1. **爬取多个来源** - EuropaTrackdays、Driven.pt、Motor Sponsor、CRM Caterham
2. **使用 Playwright** 处理 JavaScript 密集型网站
3. **使用 OCR 和 Claude Vision** 处理 PDF 传单和基于图片的日历
4. **输出 YAML** 包含结构化事件数据

YAML 是一个很好的格式，因为它易于读写，我也可以很容易地发现错误并手动编辑。

```yaml
# calendars/track-days.yaml（自动生成）
gist:
  id: 12344asdasd257be07871234asddfg123
  filename: track_days.ics
calendar:
  name: "Fab • Track Days"
  timezone: Europe/Lisbon
events:
  - date: "2026-01-11"
    time: "09:00"
    title: "Portimão - Gedlich Racing"
    duration_minutes: 540
    description: "Endless Summer | €3,290 | Open Pit Lane..."
    url: https://en.europatrackdays.com/trackday/29919/...
```

然后 YAML 同步到我的日历订阅的 Gist。

当我询问"更新我的赛道日日历"时，Claude 运行爬虫、更新 YAML 并同步到 gist。我的日历自动刷新。

实际上，我要求 Claude 创建一个 `sync.py` 脚本，将 YAML 转换为 iCalendar 格式并推送到 GitHub：

```bash
# 列出可用的日历
calendars/sync.py list

# 预览即将到来的事件
calendars/sync.py preview sim-racing

# 同步到 gist（使用 `gh` CLI）
calendars/sync.py sync sim-racing
```

我在 Google 日历和 Apple 日历中订阅了这些 Gist URL 一次：

```
https://gist.githubusercontent.com/linuz90/.../raw/sim_racing.ics
https://gist.githubusercontent.com/linuz90/.../raw/track_days.ics
```

现在当我发送"将比利时比赛添加到下周四的模拟赛车日历"时，Claude：

1. 编辑 `sim-racing.yaml`
2. 运行 `sync.py sync sim-racing`
3. Gist 更新
4. 我的手机日历在几分钟内刷新

我可以从世界任何地方管理我的赛车日历，通过 Telegram。

## 示例：Claude 作为研究员

我经常使用的另一个模式是让 Claude 为我进行彻底的研究。无论我是在比较产品、调查主题还是做出购买决定，Claude 都会搜索多个来源并将发现综合成清晰的建议。

![研究示例](../assets/demo-research.gif)

现在设置使用一个 **`research` 技能**处理整个工作流程：

```markdown
---
name: research
description: 使用网络搜索、Reddit 和 Hacker News 彻底研究主题，然后将发现保存到笔记。当被要求研究、比较选项、调查主题或查找优缺点时使用。
allowed-tools: WebSearch, WebFetch, Bash(reddit.sh:*), Bash(hn.sh:*), Read, Write, Edit, Glob
---

# 研究工作流程

**关键：每个研究任务必须在响应之前将结果保存到 `~/Documents/Notes/Research/`。**

## 过程

1. 首先在 `~/Documents/Notes/Research/` 检查现有研究
2. 使用多个来源彻底搜索：
   - WebSearch 获取一般信息
   - Reddit 获取社区见解
   - Hacker News 获取技术/创业讨论
3. **综合**发现并给出清晰建议
4. **保存到文件** - 如果存在则更新
```

该技能包括社区来源的脚本：

**Reddit** - 真实世界的意见和体验：

```bash
reddit.sh top iRacing,simracing --time week --limit 10 --preview
reddit.sh search "BMW M2 front splitter" --time all --limit 20 --preview
```

**Hacker News** - 技术和创业讨论：

```bash
hn.sh top --limit 5 --min-score 100        # 本周热门故事
hn.sh search "startup pricing" --preview    # 搜索带评论
```

`--preview` 标志包含完整帖子内容和热门评论，这才是真正有见地的地方。

当我发送类似"研究我的模拟赛车装备升级选项"的消息时，Claude：

1. **检查现有研究** - 在 `Research/` 中查找任何关于该主题的先前文件
2. **搜索网络** - 使用网络搜索查找产品评论和专家意见
3. **搜索 Reddit 和 HN** - 找到带有真实世界体验的社区讨论
4. **综合所有内容** - 结合规格、评论和社区反馈
5. **保存研究** - 创建一个带日期的文件，如 `2025-12-30-sim-racing-rig-upgrade.md`

结果是一个包含清晰建议和所有来源链接的综合研究文档。我喜欢我可以随时随地从任何地方触发这个。

## 示例：Claude 作为同事

自从将 **Slack、Linear 和 Notion** 集成到我的设置中后，Claude 可以充当追踪工作情况的同事。

当我离开几天后，我可以询问：

- "我的同事们在做什么？有什么阻塞吗？"
- "让我看看 #progress-updates 频道的最新消息"
- "API v2 项目最新情况怎么样？"

Claude 检查 Slack 的最新消息和线程、Linear 的问题更新和阻塞、Notion 的任何新规范或文档——然后总结与我相关的内容。

### 设置 Slack 访问

要使其正常工作，你需要创建一个具有正确权限的 Slack 应用：

1. **在 [api.slack.com/apps](https://api.slack.com/apps) 创建 Slack 应用**
2. 在"OAuth & Permissions"下添加 OAuth 范围：
   - `channels:history` - 读取公共频道中的消息
   - `channels:read` - 列出频道
   - `groups:history` - 读取私人频道中的消息（可选）
   - `groups:read` - 列出私人频道（可选）
3. **将应用安装到你的工作区**并复制 Bot User OAuth Token
4. **邀请机器人**到你想要它读取的频道（每个频道使用 `/invite @YourBotName`）

机器人只能看到它被邀请到的频道中的消息，这让你可以控制 Claude 可以访问什么。

### CLI

我要求 Claude 构建一个简单的 Slack CLI：

```bash
bun run cli/integrations/slack.ts channels              # 列出已加入的频道
bun run cli/integrations/slack.ts messages general      # #general 的最近消息
bun run cli/integrations/slack.ts recent                # 所有频道的最近消息
bun run cli/integrations/slack.ts thread <url>          # 来自 Slack URL 的完整线程
```

结合 Linear 和 Notion 访问，Claude 可以给我一个完整的工作情况图景——所有这些都来自我喝咖啡时快速的 Telegram 消息。

最终，是否创建脚本、技能、命令或它们的任何组合来增强你的代理以协助你取决于你。天空是极限，而且这似乎每天都在发展。

我很想知道你正在构建什么，[在 X 上联系我](https://x.com/linuz90)。
