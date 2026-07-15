# jira-figma-copilot-ux-skills

Jira × Figma × Copilot UX Skill 工作区，用于帮助 UX 设计师从 Jira 需求和 Figma 设计中生成两类中文文档：

- 设计过程简报：用于需求理解、流程拆解和设计起稿。
- UX 评审报告：用于设计走查、交付前检查，以及给 PM/PO、FE/BE、QA 的行动项。

本仓库把正式 UX skill、试用协作材料和本地 MCP server 分开管理。

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

### 2. 创建 Atlassian API Token

这个 token 用于让本地 MCP server 读取 Jira 内容。

1. 打开 Atlassian 账号安全页面：

   ```text
   https://id.atlassian.com/manage-profile/security/api-tokens
   ```

2. 使用你的 Porsche Digital / Atlassian 账号登录。
3. 在页面中找到 **API tokens** 区域。
4. 点击 **Create API token**。
5. 在 **Label** 中填写一个容易识别的名称，例如：

   ```text
   VS Code UX Skill MCP
   ```

6. 点击 **Create**。
7. 页面会显示新 token。点击 **Copy**，先临时保存在安全位置。

注意：token 只会完整显示一次。如果关掉页面后忘记复制，需要重新创建一个。

### 3. 配置 Jira `.env`

复制环境变量模板：

```bash
cp mcp-servers/atlassian-server/.env.example mcp-servers/atlassian-server/.env
```

打开这个文件：

```text
mcp-servers/atlassian-server/.env
```

填写三项：

```env
ATLASSIAN_HOST=porschedigital.atlassian.net
ATLASSIAN_EMAIL=your-email@porsche.digital
ATLASSIAN_API_TOKEN=your-api-token
```

填写说明：

- `ATLASSIAN_HOST` 不要加 `https://`。
- `ATLASSIAN_EMAIL` 使用你能打开 Jira issue 的 Atlassian 邮箱。
- `ATLASSIAN_API_TOKEN` 粘贴第 2 步创建的 token。

不要提交 `.env`。本仓库已经通过 `.gitignore` 忽略 `.env`。

### 4. 安装 Jira MCP server 依赖

```bash
cd mcp-servers/atlassian-server
npm install
cd ../..
```

### 5. 刷新 VS Code MCP

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

### 6. 测试 Jira 是否可读

在 Copilot / Agent chat 中输入：

```text
Use the atlassian MCP server to read Jira issue CARTS-7329.
```

如果可以读到，再换成你的目标 Jira 卡号。

### 7. 测试 Figma 是否可读

确保你的 Figma 账号可以打开目标文件或节点链接。

在 Copilot / Agent chat 中输入：

```text
Use the Figma MCP server to inspect this Figma link: <figma-url>.
```

如果 Figma 要求授权，按 VS Code / Figma 的授权提示完成即可。

### 8. 运行完整 UX workflow

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

## 常见问题

### Jira MCP 读不到卡片

请检查：

- `mcp-servers/atlassian-server/.env` 是否存在；
- `ATLASSIAN_HOST` 是否没有包含 `https://`；
- `ATLASSIAN_EMAIL` 是否是能打开该 Jira issue 的账号；
- Atlassian API token 是否已经复制完整，没有多余空格或引号；
- 是否已经在 `mcp-servers/atlassian-server` 下运行过 `npm install`；
- 配置后是否重载过 VS Code。

### 找不到 API token 页面

可以从 Atlassian 手动进入：

1. 打开 `https://id.atlassian.com/`。
2. 登录你的 Atlassian 账号。
3. 进入 **Manage profile**。
4. 打开 **Security**。
5. 找到 **API tokens**。
6. 点击 **Create API token**。

### Figma MCP 读不到文件

请检查：

- 你的 Figma 账号是否能打开该文件或节点链接；
- VS Code 是否已经加载 `.vscode/mcp.json`；
- 是否完成了 Figma MCP 授权；
- 如果完整链接失败，可以提供精确 node URL 或 node id。

### 为什么 output 文件没有推到 GitHub？

`output/` 下生成的报告是本地工作文件，默认被 Git 忽略。这样可以避免把试用报告、项目结论或敏感信息误提交到 GitHub。
