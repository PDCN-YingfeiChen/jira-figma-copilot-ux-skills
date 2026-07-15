# jira-figma-copilot-ux-skills

Jira to Figma UX skills and designer trial materials.

This workspace separates formal UX skills from collaboration and trial materials.

## Who This Is For

This repository is for UX designers who want to use VS Code / Copilot / Agent workflows to:

- read Jira requirements,
- inspect Figma designs,
- turn Jira requirements into a design brief,
- compare Jira and Figma,
- generate UX review notes for PM/PO, FE/BE, and QA.

The default output language is Chinese.

## Quick Start For Designers

### 1. Clone this repository

Use the repository URL shared by the owner.

SSH:

```bash
git clone git@github.com:PDCN-YingfeiChen/jira-figma-copilot-ux-skills.git
```

HTTPS:

```bash
git clone https://github.com/PDCN-YingfeiChen/jira-figma-copilot-ux-skills.git
```

Then open the folder in VS Code.

### 2. Prepare Jira access

Create an Atlassian API token:

```text
https://id.atlassian.com/manage-profile/security/api-tokens
```

Copy the env template:

```bash
cp mcp-servers/atlassian-server/.env.example mcp-servers/atlassian-server/.env
```

Fill in:

```env
ATLASSIAN_HOST=porschedigital.atlassian.net
ATLASSIAN_EMAIL=your-email@porsche.digital
ATLASSIAN_API_TOKEN=your-api-token
```

Never commit `.env`.

### 3. Install the Jira MCP server dependencies

```bash
cd mcp-servers/atlassian-server
npm install
cd ../..
```

### 4. Refresh VS Code MCP

This repo includes workspace MCP config:

```text
.vscode/mcp.json
```

It registers:

- `atlassian` for Jira access
- `figma` for Figma MCP access

After installing dependencies and filling `.env`, reload VS Code:

```text
Cmd + Shift + P -> Developer: Reload Window
```

If your VS Code has MCP commands, you can also use:

```text
MCP: Restart Servers
MCP: List Servers
```

### 5. Test Jira access

In Copilot / Agent chat:

```text
Use the atlassian MCP server to read Jira issue CARTS-7329.
```

If it works, try your target Jira issue.

### 6. Test Figma access

Open Figma in browser or desktop and make sure your account can access the file.

In Copilot / Agent chat:

```text
Use the Figma MCP server to inspect this Figma link: <figma-url>.
```

If Figma asks for authorization, follow the VS Code/Figma authorization prompt.

### 7. Run the UX workflow

Use this prompt:

```text
Jira: CARTS-xxxx
Figma: https://www.figma.com/design/...

Please run the full Jira × Figma UX skill workflow.
Generate:
1. output/<jira-key>-design-brief.md
2. output/<jira-key>-ux-review.md

Use Chinese.
Keep findings traceable to Jira or Figma evidence.
If reading Jira or Figma fails, stop and explain what failed.
```

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

## Output Format

The workflow generates two Chinese Markdown reports by default:

```text
output/<jira-key>-design-brief.md
output/<jira-key>-ux-review.md
```

- `design-brief` is for design-process work: requirement extraction, acceptance criteria interpretation, user flow, states, and Figma draft guidance.
- `ux-review` is for review and handoff: Jira-Figma gaps, PM/PO clarifications, FE/BE implementation notes, QA test notes, risks, and a suggested Jira comment.

## Security Notes

- Do not commit `.env` files.
- Do not commit real Jira or Figma tokens.
- Do not paste tokens into Markdown files, Jira comments, screenshots, or chat messages.
- Mock mode and real API mode must stay clearly separated.
- Real API mode must stop on fetch failure and must not silently fall back to mock data.

## VS Code MCP Setup

This repository includes a local Atlassian MCP server for Jira access:

```text
mcp-servers/atlassian-server/
```

### 1. Configure Jira credentials

Copy the example env file:

```bash
cp mcp-servers/atlassian-server/.env.example mcp-servers/atlassian-server/.env
```

Fill in:

```env
ATLASSIAN_HOST=porschedigital.atlassian.net
ATLASSIAN_EMAIL=your-email@porsche.digital
ATLASSIAN_API_TOKEN=your-api-token
```

Do not commit `.env`.

### 2. Install server dependencies

```bash
cd mcp-servers/atlassian-server
npm install
```

### 3. Use in VS Code

The workspace MCP config is stored in:

```text
.vscode/mcp.json
```

It registers:

- `atlassian` for Jira access
- `figma` for Figma MCP access

After installing dependencies and filling `.env`, restart VS Code or refresh MCP servers.

### 4. Test prompts

```text
Use the atlassian MCP server to read Jira issue CARTS-1234.
```

```text
Use the Figma MCP server to inspect this Figma link: <url>.
```

## Troubleshooting

### Jira MCP cannot read the issue

Check:

- `mcp-servers/atlassian-server/.env` exists.
- `ATLASSIAN_HOST` does not include `https://`.
- The Atlassian token belongs to the same account that can open the Jira issue in browser.
- You ran `npm install` inside `mcp-servers/atlassian-server`.
- VS Code was reloaded after configuration.

### Figma MCP cannot inspect the file

Check:

- Your Figma account can open the file and node link.
- VS Code has loaded `.vscode/mcp.json`.
- You completed any Figma MCP authorization prompt.
- If a node link fails, provide the exact node URL or node id.

### Output files are not pushed to GitHub

Generated reports under `output/` are local working files and are ignored by Git by default. This prevents trial reports or sensitive project findings from being committed accidentally.
