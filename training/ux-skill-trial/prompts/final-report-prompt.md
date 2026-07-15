# Final Report Prompt

Create two Chinese Markdown files:

```text
output/<jira-key>-design-brief.md
output/<jira-key>-ux-review.md
```

## 1. Design Brief

Use this file for design-process work before or during design.

```md
# <JIRA-KEY> 设计过程简报

## 来源状态
## 需求提取
### Story 信息
### 背景
### 目标用户
### 用户问题
### UX 目标

## 功能需求拆解
| ID | 需求 | 来源 | 优先级 |
|---|---|---|---|

## 验收条件整理
| ID | 验收条件 | 设计含义 |
|---|---|---|

## 用户流程 / 配置流程
### 主流程
### 异常流程
### 状态清单

## Figma 起稿 / 补稿提示
### B 端配置面板
### C 端展示参考

## 组件建议
## 待确认问题
## 设计前检查清单
```

## 2. UX Review Report

Use this file after Figma exists and the goal is review/handoff readiness.

```md
# <JIRA-KEY> UX 评审报告

## 来源状态
## 整体状态
## 执行摘要

## Jira 需求摘要
### 已确认需求
### 验收条件
### Jira 中仍需澄清的问题

## Figma 证据摘要
### 已覆盖的设计证据
### 缺失或证据较弱的设计内容

## Jira-Figma 差异分析
| 需求 | Jira 来源 | Figma 证据 | 状态 | 严重程度 | 建议动作 |
|---|---|---|---|---|---|

## PM / PO 需要补充或确认的内容
| 缺失 / 模糊项 | 为什么重要 | 建议补充到 PRD / Jira 的内容 | Owner |
|---|---|---|---|

## FE / BE 实现注意事项
| 模块 | 注意事项 | 来源 / 证据 | 建议处理 |
|---|---|---|---|

## QA / 测试注意事项
| 测试场景 | 预期结果 | 优先级 | 来源 |
|---|---|---|---|

## UX 风险
## 建议下一步
## 建议贴回 Jira 的评论
```

Rules:

- Default output language is Chinese unless the user asks otherwise.
- If source data is mock, mark it as mock validation.
- If source data is placeholder, stop.
- Do not overclaim readiness.
- Keep `design-brief` focused on requirement decomposition and user flow.
- Keep `ux-review` focused on comparison, gaps, and stakeholder action items.
- PM / PO section is for PRD/Jira missing info and decisions.
- FE / BE section is for implementation, API, data, and state-handling notes.
- QA section is for concrete test scenarios and regression risks.
