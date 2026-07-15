---
name: Level 5 - Gap Report Generator
version: 0.2
owner: UX Team
status: draft
last_updated: 2026-07
depends_on: Level 0, Level 1, Level 2, Level 3, Level 4
---

# Level 5 Skill: Gap Report Generator

## Purpose

Turn Jira requirements, Figma evidence, user-flow reasoning, and comparison results into one concise Chinese UX review report that different stakeholders can act on.

The report should not be a long chat answer. Prefer writing a Markdown file and returning only a short summary plus file path in chat.

## Output

Generate the review file:

```text
output/<jira-key>-ux-review.md
```

Use this structure:

```md
# <JIRA-KEY> UX 评审报告

## 来源状态
- 模式：
- Jira:
- Figma:
- 有效性：

## 整体状态
可进入下一步 / 需要修改 / 阻塞

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
只列需要 PM/PO 补充到 PRD/Jira 或明确决策的内容。

| 缺失 / 模糊项 | 为什么重要 | 建议补充到 PRD / Jira 的内容 | Owner |
|---|---|---|---|

## FE / BE 实现注意事项
列出工程实现需要关注的 API、数据结构、状态和跨端依赖。

| 模块 | 注意事项 | 来源 / 证据 | 建议处理 |
|---|---|---|---|

## QA / 测试注意事项
列出 QA 应覆盖的测试场景和验收风险。

| 测试场景 | 预期结果 | 优先级 | 来源 |
|---|---|---|---|

## UX 风险

## 建议下一步

## 建议贴回 Jira 的评论
```

## Overall Status Criteria

### 可进入下一步

Use only when core Jira requirements are covered, required states are present, no critical/high gaps exist, and source material is sufficient.

### 需要修改

Use when the main flow exists but important states, edge cases, acceptance criteria, or stakeholder clarifications are missing.

### 阻塞

Use when a critical requirement is missing, Jira and Figma conflict on core behavior, source material is missing, source content is placeholder, or real API/Figma reading failed.

## Stakeholder Routing Rules

- Put unclear requirement, scope, business rule, copy, AC, and PRD/Jira gaps under `PM / PO 需要补充或确认的内容`.
- Put API contract, data mapping, validation logic, save/readback behavior, cross-end dependencies, and implementation constraints under `FE / BE 实现注意事项`.
- Put scenario coverage, edge cases, regression scope, validation states, empty/loading/error states, and acceptance risks under `QA / 测试注意事项`.
- Keep recommendations traceable to Jira text or Figma evidence.
- Do not put generic advice in stakeholder sections; every row should be actionable.

## Prompt

```text
Please generate one Chinese Markdown UX review report based on Jira and Figma evidence.

The report should be concise, actionable, and organized by stakeholder:
1. PM / PO: what is missing or ambiguous in PRD/Jira and needs clarification.
2. FE / BE: implementation notes and data/API/state handling risks.
3. QA: test scenarios and acceptance risks.

Rules:
- Use Jira as the source of truth for requirements.
- Use Figma as the source of truth for design implementation.
- Do not hide missing information.
- Prioritize blockers and high-severity issues.
- Keep recommendations actionable and traceable.
- Use neutral design review language.
- Do not claim the design is ready if critical requirements are missing.
- Do not generate a final real report from placeholder content.
```
