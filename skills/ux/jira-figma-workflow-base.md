---
name: Level 0 - Jira Figma Copilot UX Workflow Base
version: 0.1
owner: UX Team
status: draft
last_updated: 2026-07
---

# Level 0 Skill: Jira × Figma × Copilot UX Workflow Base

## 1. Purpose

This skill defines the global working principles, source hierarchy, output standards, and quality rules for the Jira × Figma × Copilot UX workflow.

It is the base instruction for all downstream skills:

- Level 1: Jira Requirement Extraction
- Level 2: User Flow Generation
- Level 3: Figma Design Prompt Generation
- Level 4: Jira-Figma Comparison
- Level 5: Gap Report Generation

## 2. Core Workflow

```text
Jira issue
↓
Requirement extraction
↓
User flow generation
↓
Figma design prompt generation
↓
Figma content review
↓
Jira-Figma comparison
↓
Gap report
```

Expected outputs:

```text
output/<jira-key>-design-brief.md
output/<jira-key>-ux-review.md
```

Use `design-brief` for design-process work before or during design: requirement extraction, acceptance criteria interpretation, user flow, states, and Figma prompt. Use `ux-review` after Figma exists: Jira-Figma comparison, stakeholder clarifications, engineering notes, QA notes, risks, and Jira comment.

## 3. Source of Truth

| Source | Role |
|---|---|
| Jira | Source of truth for requirements |
| Figma | Source of truth for design implementation |
| Copilot | Assistant for extraction, reasoning, generation, and checking |
| Designer | Final decision maker |
| PM / Engineering | Requirement and feasibility confirmation owners |

Rules:

1. Jira defines what needs to be solved.
2. Figma shows what has been designed.
3. Copilot can infer structure, but must not invent missing requirements.
4. If Jira and Figma conflict, flag the conflict instead of resolving it silently.
5. If information is missing, mark it as `Needs clarification`.

## 4. Operating Modes

### 4.1 Real API Mode

Use real API mode when Jira and Figma tokens are available and API integration is implemented.

Expected behavior:

```text
- Fetch real Jira issue content.
- Fetch real Figma file or node content.
- Generate outputs based on real data.
- Stop if Jira or Figma fetching fails.
```

Real mode must never:

```text
- Use mock data.
- Generate placeholder content.
- Pretend API fetching succeeded.
- Hide API errors.
- Replace failed API responses with fake content.
```

### 4.2 Mock Validation Mode

Use mock mode when tokens are unavailable or API integration is not ready.

Expected input:

```text
mock/
├─ mock-jira-issue.md
└─ mock-figma-content.md
```

Mock mode is valid for testing skill logic, output structure, and designer trial. Mock mode must not be presented as real Jira-Figma API validation.

## 5. Input Contract

### Jira Input

```text
- Issue key
- Title / Summary
- Description
- Acceptance Criteria
- Comments
- Labels
- Status
- Priority
- Attachments metadata
```

### Figma Input

```text
- File name
- Page names
- Section names
- Frame names
- Text layers
- Component names
- Component instances
- Interaction states
- Comments
- Dev notes
- Design system references
```

## 6. Placeholder Detection Rules

Reject content containing:

```text
Placeholder requirement
Jira fetching is not implemented yet
Replace this placeholder with real API integration
Mock validation
Sample data
Dummy data
Fake issue
Not implemented
```

If detected in real mode, stop and report:

```text
The current source data is placeholder content and cannot be used for real UX analysis.
Please fix the Jira/Figma fetching workflow or switch to mock validation mode.
```

## 7. Global Reasoning Rules

```text
1. Do not invent requirements.
2. Do not invent Figma evidence.
3. Do not treat frame names alone as complete evidence unless supported by text, components, states, or comments.
4. Mark missing information as Needs clarification.
5. Distinguish confirmed facts from assumptions.
6. Keep every output traceable to Jira or Figma evidence.
7. Make recommendations actionable.
8. Use neutral design review language.
9. Prioritize critical user flow and acceptance criteria coverage.
10. Keep outputs useful for UX designers, PMs, and engineers.
```

## 8. Output Standards

All outputs should be Markdown.

Requirement output should include:

```text
- Issue
- Business Background
- User Problem
- Target User
- UX Goal
- Functional Requirements
- Acceptance Criteria
- Constraints
- Dependencies
- Risks
- Open Questions
```

User flow output should include:

```text
- Entry Points
- Main Flow
- Alternative Flows
- Error Flows
- Empty States
- Loading States
- Success States
- Required Screens
- Required Components
```

Figma prompt output should include:

```text
- Feature Context
- Design Goal
- Required Screens
- Frame Hierarchy
- Screen-by-Screen Guidance
- Component Suggestions
- Interaction States
- Edge Cases
- Accessibility Notes
- Developer Handoff Notes
```

Comparison output should include:

```text
- Overall Status
- Requirement Coverage Table
- Missing Items
- Partially Covered Items
- Conflicts
- Needs Clarification
- Recommended Actions
```

## 9. Comparison Status Definitions

| Status | Definition |
|---|---|
| Covered | Figma fully covers the Jira requirement |
| Partially covered | Figma covers part of the requirement but misses important details, states, or edge cases |
| Missing | Jira requires something that is not found in Figma |
| Conflict | Figma contradicts Jira |
| Not applicable | The requirement is not relevant to the current design scope |
| Needs clarification | Source material is insufficient to judge |

## 10. Severity Definitions

| Severity | Definition |
|---|---|
| Critical | Blocks delivery or affects a core requirement |
| High | Affects the main user flow or acceptance criteria |
| Medium | Affects clarity, edge cases, or handoff quality |
| Low | Minor documentation, polish, or review issue |

## 11. Overall Status Definitions

### Ready

Use only when core Jira requirements are covered, required states are present, no critical/high gaps exist, and source material is sufficient.

### Needs revision

Use when the main flow exists but important states, edge cases, or acceptance criteria are missing.

### Blocked

Use when a critical requirement is missing, Jira/Figma conflict on core behavior, source material is missing, source content is placeholder, or real API mode failed.

## 12. Standard Prompt

```text
Please run the Jira × Figma × Copilot UX workflow.

Tasks:
1. Identify whether the current input is real API data, mock data, or placeholder data.
2. If the input is placeholder, stop and explain what is missing.
3. If the input is valid, extract UX requirements from Jira.
4. Generate a design brief with requirement decomposition, user flow, states, and Figma draft guidance.
5. Compare Jira requirements with Figma content.
6. Generate a UX review report organized by PM/PO, FE/BE, and QA action items.

Use Jira as the source of truth for requirements.
Use Figma as the source of truth for design implementation.
Do not invent missing requirements.
Do not invent Figma evidence.
Mark unclear items as Needs clarification.
Make every finding traceable to Jira or Figma evidence.
Default output language is Chinese.
```

## 13. Acceptance Criteria for Level 0

```text
- Workflow scope is clear.
- Jira and Figma source roles are defined.
- Real mode and mock mode are separated.
- Placeholder content is explicitly rejected.
- Output standards are defined.
- Comparison statuses are defined.
- Severity levels are defined.
- Downstream skills can reuse this base instruction.
```
