---
name: Level 4 - Jira Figma Comparison
version: 0.1
owner: UX Team
status: draft
last_updated: 2026-07
depends_on: Level 0, Level 1, Level 2, Level 3
---

# Level 4 Skill: Jira-Figma Comparison

## Purpose

Compare Jira requirements against Figma design content to identify coverage, missing items, partial coverage, and conflicts.

## Input

Jira:

```text
- Functional requirements
- Acceptance criteria
- Constraints
- UX goals
```

Figma:

```text
- Page names
- Frame names
- Section names
- Text layers
- Component names
- Interaction states
- Comments
- Dev notes
```

## Output

Write the following sections into `output/<jira-key>-ux-review.md`:

```md
## Figma 证据摘要
### 已覆盖的设计证据
### 缺失或证据较弱的设计内容

## Jira-Figma 差异分析
| 需求 | Jira 来源 | Figma 证据 | 状态 | 严重程度 | 建议动作 |
|---|---|---|---|---|---|
```

## Status Labels

| Status | Meaning |
|---|---|
| Covered | Figma fully covers the Jira requirement |
| Partially covered | Figma covers part of the requirement but misses important details or states |
| Missing | Jira requires something that is not found in Figma |
| Conflict | Figma contradicts Jira |
| Not applicable | Requirement is not relevant to current design scope |
| Needs clarification | Source material is insufficient to judge |

## Severity Labels

| Severity | Meaning |
|---|---|
| Critical | Blocks delivery |
| High | Affects main user flow or acceptance criteria |
| Medium | Affects clarity, edge cases, or handoff quality |
| Low | Minor documentation or polish issue |

## Prompt

```text
Please compare the Jira requirements with the Figma design content.

Use Jira as the source of truth for requirements.
Use Figma as the source of truth for design implementation.

For each Jira requirement, classify as:
- Covered
- Partially covered
- Missing
- Conflict
- Not applicable
- Needs clarification

Rules:
- If Jira requires something but there is no Figma evidence, mark Missing.
- If Figma covers the happy path but misses edge cases, mark Partially covered.
- If Figma contradicts Jira, mark Conflict.
- If evidence is weak, explain what needs manual verification.
- Do not treat frame names alone as complete evidence unless supported by text, components, states, or comments.
- Do not invent Figma content.
```
