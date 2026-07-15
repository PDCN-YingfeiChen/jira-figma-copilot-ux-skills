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

Generate `output/user-flow.md`:

```md
# User Flow

## Source Status

## Feature Name

## Entry Points

## Main Flow
| Step | Actor | Action | System Response | Related Requirement |
|---|---|---|---|---|

## Alternative Flows

## Error Flows

## Empty States

## Loading States

## Success States

## Disabled States

## Required Screens

## Required Components

## Open Questions
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
