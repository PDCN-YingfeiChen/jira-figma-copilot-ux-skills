---
name: Level 5 - Gap Report Generator
version: 0.1
owner: UX Team
status: draft
last_updated: 2026-07
depends_on: Level 0, Level 1, Level 2, Level 3, Level 4
---

# Level 5 Skill: Gap Report Generator

## Purpose

Turn the requirement summary, user flow, Figma prompt, and comparison result into a concise review report.

## Output

Generate `output/final-ux-analysis.md`:

```md
# Final UX Analysis Report

## Source Status

## Overall Status

## Executive Summary

## Requirement Summary

## User Flow Summary

## Figma Design Prompt Summary

## Jira-Figma Gap Report

### Covered Requirements

### Missing Requirements

### Partially Covered Requirements

### Conflicts

### Needs Clarification

## UX Risks

## PM / Engineering Questions

## Recommended Next Steps

## Suggested Jira Comment
```

## Overall Status Criteria

### Ready

Use only when core Jira requirements are covered, required states are present, no critical/high gaps exist, and source material is sufficient.

### Needs revision

Use when main flow exists but important states, edge cases, or acceptance criteria are missing.

### Blocked

Use when a critical requirement is missing, Jira and Figma conflict on core behavior, source material is missing, source content is placeholder, or real API mode failed.

## Prompt

```text
Please generate a final Jira-Figma UX gap report based on:
- Requirement Summary
- User Flow
- Figma Design Prompt
- Jira-Figma Comparison

The report should be concise, actionable, and useful for UX designers, PMs, and engineers.

Rules:
- Do not hide missing information.
- Prioritize blockers and high-severity issues.
- Keep recommendations actionable.
- Use neutral design review language.
- Do not claim the design is ready if critical requirements are missing.
- Do not generate a final real report from placeholder content.
```
