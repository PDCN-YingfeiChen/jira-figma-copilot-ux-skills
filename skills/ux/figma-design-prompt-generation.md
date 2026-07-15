---
name: Level 3 - Figma Design Prompt Generation
version: 0.1
owner: UX Team
status: draft
last_updated: 2026-07
depends_on: Level 0, Level 1, Level 2
---

# Level 3 Skill: Figma Design Prompt Generation

## Purpose

Convert requirements and user flow into a Figma-oriented design prompt for wireframing or design start.

## Output

Generate `output/figma-prompt.md`:

```md
# Figma Design Prompt

## Source Status

## Feature Context

## Design Goal

## Required Screens

## Frame Hierarchy

## Screen-by-Screen Guidance

## Component Suggestions

## Interaction States

## Edge Cases

## Accessibility Notes

## Developer Handoff Notes

## Open Questions
```

## Prompt

```text
Please generate a Figma-oriented UX design prompt based on the requirement summary and user flow.

Include:
1. Feature context
2. Design goal
3. Required screens
4. Frame hierarchy
5. Screen-by-screen content guidance
6. Component suggestions
7. Interaction states
8. Edge cases
9. Accessibility notes
10. Developer handoff notes

Rules:
- The prompt should be specific enough to guide wireframing.
- Include all states required by Jira acceptance criteria.
- Mention missing states or unclear behaviors as "Needs clarification".
- Do not invent unsupported business rules.
- Prefer reusable design system components when possible.
```
