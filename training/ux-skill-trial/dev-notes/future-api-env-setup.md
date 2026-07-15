# Environment Setup for Future API Version

Current trial package does not require tokens.

For future real API mode, use `.env` next to `package.json`:

```env
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_EMAIL=your.company.email@company.com
JIRA_API_TOKEN=your_jira_api_token
FIGMA_ACCESS_TOKEN=your_figma_token
```

Rules:

```text
- Never commit .env to Git.
- Never print token values in logs.
- Real mode must stop if token or API fetching fails.
- Real mode must not fallback to placeholder or mock content.
```
