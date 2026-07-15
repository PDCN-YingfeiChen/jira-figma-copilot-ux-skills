# jira-figma-copilot-ux-skills

Jira × Figma × Copilot UX Skill 工作区，用于帮助 UX 设计师从 Jira 需求和 Figma 设计中生成两类中文文档：

- 设计过程简报：用于需求理解、流程拆解和设计起稿。
- UX 评审报告：用于设计走查、交付前检查，以及给 PM/PO、FE/BE、QA 的行动项。

本仓库把正式 UX skill 和试用协作材料分开管理。

## 适用对象

本仓库适合希望在 VS Code / Copilot / Agent 中完成以下工作的 UX 设计师：

- 读取 Jira 需求；
- 读取或检查 Figma 设计；
- 将 Jira 需求拆解成设计简报；
- 对比 Jira 与 Figma 的覆盖情况；
- 生成给 PM/PO、FE/BE、QA 使用的 UX 评审结论。

默认输出语言为中文。

## 设计师快速开始

### 1. Clone 仓库

使用仓库 owner 分享的地址 clone。

SSH：

```bash
git clone git@github.com:PDCN-YingfeiChen/jira-figma-copilot-ux-skills.git
```

HTTPS：

```bash
git clone https://github.com/PDCN-YingfeiChen/jira-figma-copilot-ux-skills.git
```

然后用 VS Code 打开该文件夹。

### 2. 准备 Jira 访问权限

先创建 Atlassian API token：

```text
https://id.atlassian.com/manage-profile/security/api-tokens
```

复制环境变量模板：

```bash
cp mcp-servers/atlassian-server/.env.example mcp-servers/atlassian-server/.env
```

填写：

```env
ATLASSIAN_HOST=porschedigital.atlassian.net
ATLASSIAN_EMAIL=your-email@porsche.digital
ATLASSIAN_API_TOKEN=your-api-token
```

注意：不要提交 `.env`。

### 3. 安装 Jira MCP server 依赖

```bash
cd mcp-servers/atlassian-server
npm install
cd ../..
```

### 4. 刷新 VS Code MCP

本仓库已经包含 workspace 级 MCP 配置：

```text
.vscode/mcp.json
```

其中注册了：

- `atlassian`：用于读取 Jira；
- `figma`：用于读取 Figma MCP。

配置 `.env` 并安装依赖后，重载 VS Code：

```text
Cmd + Shift + P -> Developer: Reload Window
```

如果你的 VS Code 支持 MCP 命令，也可以使用：

```text
MCP: Restart Servers
MCP: List Servers
```

### 5. 测试 Jira 是否可读

在 Copilot / Agent chat 中输入：

```text
Use the atlassian MCP server to read Jira issue CARTS-7329.
```

如果可以读到，再换成你的目标 Jira 卡号。

### 6. 测试 Figma 是否可读

确保你的 Figma 账号可以打开目标文件或节点链接。

在 Copilot / Agent chat 中输入：

```text
Use the Figma MCP server to inspect this Figma link: <figma-url>.
```

如果 Figma 要求授权，按 VS Code / Figma 的授权提示完成即可。

### 7. 运行完整 UX workflow

可以使用下面的 prompt：

```text
Jira: CARTS-xxxx
Figma: https://www.figma.com/design/...

请完整运行 Jira × Figma UX skill workflow。
生成：
1. output/<jira-key>-design-brief.md
2. output/<jira-key>-ux-review.md

使用中文输出。
所有结论都需要能追溯到 Jira 或 Figma 证据。
如果 Jira 或 Figma 读取失败，请停止并说明失败原因。
```

## 仓库结构

```text
jira-figma-copilot-ux-skills/
├── skills/ux/                         # 正式 UX skill 源文件
├── training/ux-skill-trial/           # 设计师试用、协作和反馈材料
│   ├── QUICK_START.md
│   ├── TRANSFER_GUIDE.md
│   ├── feedback-form.md
│   ├── mock/
│   ├── output-examples/
│   ├── prompts/
│   └── dev-notes/
├── mcp-servers/atlassian-server/      # 本地 Jira/Atlassian MCP server
└── skill-role-map.yaml                # UX skill 角色映射
```

## 正式 UX Skills

- `jira-figma-workflow-base.md`
- `jira-requirement-extraction.md`
- `ux-user-flow-generation.md`
- `figma-design-prompt-generation.md`
- `jira-figma-comparison.md`
- `ux-gap-report-generator.md`

这些文件是正式 skill 源文件。稳定后可以复制到 carsales 工作区的：

```text
documents/skills/ux/
```

## 试用与协作材料

`training/ux-skill-trial/` 用于设计师 onboarding、mock validation、反馈收集和未来 API 模式说明。

这些材料不会放进 `skills/ux/`，这样正式 skill 文件夹可以保持干净。

## 输出格式

workflow 默认生成两份中文 Markdown：

```text
output/<jira-key>-design-brief.md
output/<jira-key>-ux-review.md
```

- `design-brief`：用于设计过程，包括需求提取、验收条件理解、User Flow、状态清单和 Figma 起稿提示。
- `ux-review`：用于评审和交付，包括 Jira-Figma 差异、PM/PO 需要补充的内容、FE/BE 实现注意事项、QA 测试注意事项、风险和建议贴回 Jira 的评论。

## 安全注意事项

- 不要提交 `.env` 文件。
- 不要提交真实 Jira 或 Figma token。
- 不要把 token 粘贴到 Markdown、Jira 评论、截图或聊天消息里。
- Mock mode 和 Real API mode 必须明确区分。
- Real API mode 如果读取失败，必须停止并说明原因，不能静默回退到 mock 数据。

## VS Code MCP 配置说明

本仓库包含一个本地 Atlassian MCP server，用于读取 Jira：

```text
mcp-servers/atlassian-server/
```

### 1. 配置 Jira 凭证

复制模板：

```bash
cp mcp-servers/atlassian-server/.env.example mcp-servers/atlassian-server/.env
```

填写：

```env
ATLASSIAN_HOST=porschedigital.atlassian.net
ATLASSIAN_EMAIL=your-email@porsche.digital
ATLASSIAN_API_TOKEN=your-api-token
```

不要提交 `.env`。

### 2. 安装依赖

```bash
cd mcp-servers/atlassian-server
npm install
```

### 3. 在 VS Code 中使用

workspace MCP 配置位于：

```text
.vscode/mcp.json
```

它注册了：

- `atlassian`：读取 Jira；
- `figma`：读取 Figma MCP。

安装依赖并填写 `.env` 后，重启 VS Code 或刷新 MCP servers。

### 4. 测试 prompt

```text
Use the atlassian MCP server to read Jira issue CARTS-1234.
```

```text
Use the Figma MCP server to inspect this Figma link: <url>.
```

## 常见问题

### Jira MCP 读不到卡片

请检查：

- `mcp-servers/atlassian-server/.env` 是否存在；
- `ATLASSIAN_HOST` 是否没有包含 `https://`；
- Atlassian token 是否属于能在浏览器打开该 Jira issue 的账号；
- 是否已经在 `mcp-servers/atlassian-server` 下运行过 `npm install`；
- 配置后是否重载过 VS Code。

### Figma MCP 读不到文件

请检查：

- 你的 Figma 账号是否能打开该文件或节点链接；
- VS Code 是否已经加载 `.vscode/mcp.json`；
- 是否完成了 Figma MCP 授权；
- 如果完整链接失败，可以提供精确 node URL 或 node id。

### 为什么 output 文件没有推到 GitHub？

`output/` 下生成的报告是本地工作文件，默认被 Git 忽略。这样可以避免把试用报告、项目结论或敏感信息误提交到 GitHub。
