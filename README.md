# jira-figma-copilot-ux-skills

Jira to Figma UX skills and designer trial materials.

This workspace separates formal UX skills from collaboration and trial materials.

## Structure

```text
jira-figma-copilot-ux-skills/
├── skills/ux/                         # Formal UX skill source files
├── training/ux-skill-trial/           # Designer trial and collaboration materials
│   ├── QUICK_START.md
│   ├── TRANSFER_GUIDE.md
│   ├── feedback-form.md
│   ├── mock/
│   ├── output-examples/
│   ├── prompts/
│   └── dev-notes/
└── skill-role-map.yaml                # Role mapping for the formal skill files
```

## Formal UX Skills

- `jira-figma-workflow-base.md`
- `jira-requirement-extraction.md`
- `ux-user-flow-generation.md`
- `figma-design-prompt-generation.md`
- `jira-figma-comparison.md`
- `ux-gap-report-generator.md`

These files are intended to be reviewed and later copied into `documents/skills/ux/` in the carsales workspace.

## Collaboration Materials

Use `training/ux-skill-trial/` for designer onboarding, mock validation, feedback collection, and future API-mode notes.

The training materials are intentionally kept outside `skills/ux/` so the formal skill folder stays clean.

## Security Notes

- Do not commit `.env` files.
- Do not commit real Jira or Figma tokens.
- Mock mode and real API mode must stay clearly separated.
- Real API mode must stop on fetch failure and must not silently fall back to mock data.
