---
name: Level 1 - Jira Requirement Extraction
version: 0.1
owner: UX Team
status: draft
last_updated: 2026-07
depends_on: Level 0
---

# Level 1 Skill: Jira Requirement Extraction

## Purpose

Extract UX-relevant requirements from Jira issue content and convert them into a structured UX brief.

## Input

```text
- Issue key
- Summary / Title
- Description
- Acceptance Criteria
- Comments
- Labels
- Status
- Priority
- Attachments metadata
```

## Output

Generate `output/requirement.md`:

```md
# Requirement Summary

## Source Status
- Mode:
- Source type:
- Validity:

## Issue
- Key:
- Title:
- Status:
- Priority:
- Labels:

## Business Background

## User Problem

## Target User

## UX Goal

## Functional Requirements
| ID | Requirement | Source | Priority |
|---|---|---|---|

## Acceptance Criteria
| ID | Acceptance Criterion | Source |
|---|---|---|

## Constraints

## Dependencies

## Risks

## Open Questions

## Notes for PM / Engineering
```

## Prompt

```text
Please extract UX requirements from the provided Jira issue.

Use Jira as the source of truth for requirements.

Extract:
1. Business background
2. User problem
3. Target user
4. UX goal
5. Functional requirements
6. Acceptance criteria
7. Constraints
8. Dependencies
9. Risks
10. Open questions

Rules:
- Do not invent missing information.
- If something is missing, write "Not specified".
- If something is ambiguous, list it under "Open Questions".
- Convert vague Jira descriptions into UX-actionable requirement statements.
- Keep each requirement traceable to Jira source content.
- Do not treat placeholder content as a valid Jira issue.
```

## Quality Criteria

```text
- The issue goal is clear.
- UX requirements are separated from technical notes.
- Acceptance criteria are listed explicitly.
- Missing and unclear information is visible.
- The result can be used as a UX brief.
```
