# Quick Start

## 1. 打开 Copilot Chat

使用 VS Code + GitHub Copilot Chat、Cursor、ChatGPT 或其他支持文件上下文的 AI 工具。

## 2. 读取输入文件

让 Copilot 读取：

```text
mock/mock-jira-issue.md
mock/mock-figma-content.md
prompts/copilot-analysis-prompt.md
```

## 3. 复制这段指令

```text
Please use mock/mock-jira-issue.md and mock/mock-figma-content.md as the input sources.

Then follow prompts/copilot-analysis-prompt.md to generate:
1. `output/<jira-key>-design-brief.md`
2. `output/<jira-key>-ux-review.md`

Use Jira as the source of truth for requirements.
Use Figma as the source of truth for design implementation.
Do not invent missing requirements.
Do not invent Figma evidence.
Mark unclear items as Needs clarification.
Clearly mark this as mock validation.
```

## 4. 填反馈

填写：

```text
feedback/feedback-form.md
```
