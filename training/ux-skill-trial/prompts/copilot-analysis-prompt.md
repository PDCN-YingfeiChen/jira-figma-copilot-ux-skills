# Copilot Analysis Prompt

Please use the provided Jira issue and Figma content to complete the Jira × Figma × Copilot UX Skill workflow.

## Inputs

Use:

```text
mock/mock-jira-issue.md
mock/mock-figma-content.md
```

or equivalent real Jira/Figma content if available.

## Tasks

Generate:

```text
# Requirement Summary
# User Flow
# Figma Design Prompt
# Jira-Figma Gap Report
```

## Rules

- Use Jira as the source of truth for requirements.
- Use Figma as the source of truth for design implementation.
- Do not invent missing requirements.
- Do not invent Figma evidence.
- Mark unclear items as `Needs clarification`.
- Make each comparison item traceable to Jira or Figma evidence.
- If the input is mock data, clearly mark the output as `Mock validation`.
- If the input is placeholder content, stop and explain what is missing.

## Status Labels

Use:

```text
Covered
Partially covered
Missing
Conflict
Not applicable
Needs clarification
```

## Severity Labels

Use:

```text
Critical
High
Medium
Low
```
