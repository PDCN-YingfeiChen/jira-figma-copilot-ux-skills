---
name: Level 2 - User Flow Generation
version: 0.1
owner: UX Team
status: draft
last_updated: 2026-07
depends_on: Level 0, Level 1
---

# Level 2 Skill: User Flow Generation

## Purpose

Turn a requirement summary into structured interaction logic.

## Input

```text
- Requirement Summary
- Functional Requirements
- Acceptance Criteria
- Constraints
- Open Questions
```

## Output

Write the following sections into `output/<jira-key>-design-brief.md`:

```md
## 用户流程 / 配置流程

### 主流程
| Step | 角色 | 操作 | 系统反馈 | 关联需求 |
|---|---|---|---|---|

### 异常流程
| 场景 | 触发条件 | 系统反馈 | 设计状态 |
|---|---|---|---|

### 状态清单
| 模块 | 必备状态 |
|---|---|
```

## Prompt

```text
Please generate a UX user flow based on the provided requirement summary.

Generate:
1. Entry points
2. Main flow
3. Alternative flows
4. Error flows
5. Empty states
6. Loading states
7. Success states
8. Disabled states
9. Required screens
10. Required components

Rules:
- The main flow should describe the happy path.
- Alternative flows should cover optional user decisions.
- Error flows should cover system failures and business rule failures.
- Include loading, empty, disabled, and success states where relevant.
- Do not add unsupported product logic.
- Mark unclear behavior as "Needs clarification".
```
