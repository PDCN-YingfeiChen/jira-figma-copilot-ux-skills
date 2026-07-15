# API Mode Checklist

## Check command

Real mode:

```bash
npm run analyze -- --jira CARTS-4572 --figma "Figma URL"
```

Mock mode:

```bash
npm run analyze:mock
```

## Check .env location

`.env` must be next to `package.json`.

## Check dotenv loading

Use:

```ts
import "dotenv/config";
```

or:

```ts
import dotenv from "dotenv";
dotenv.config();
```

## Search for placeholder logic

Search for:

```text
Placeholder
Jira fetching is not implemented
mock
dummy
sample
fake
not implemented
```

Real mode must not return these strings.

## Safe debug logs

Allowed:

```text
mode: real
JIRA_BASE_URL exists: true/false
JIRA_EMAIL exists: true/false
JIRA_API_TOKEN exists: true/false
FIGMA_ACCESS_TOKEN exists: true/false
Jira issue key: [issue key]
Figma file key: [file key]
Figma node id: [node id or none]
Jira API response status: [status code]
Figma API response status: [status code]
```

Never print tokens.
