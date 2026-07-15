# Atlassian MCP Server

这是 JIRA + Confluence 的 MCP Server，可在 comate 中同步 JIRA Story 到本地文档、读写 Confluence 页面。

## 功能

### 只读操作（安全）

- **列出所有 Sprint** - 查看不同状态的 Sprint
- **获取指定 Sprint 的所有 Story** - 查看 Sprint 中的 Story 列表
- **同步 Sprint Story 到本地 Markdown 文档** - 生成迭代文档
- **获取单个 Story 的详细信息** - 查看 Story 详情

### 写入操作（仅评论）

- **给 Story 添加评论** - 在 JIRA Story 中添加评论（例如：同步技术方案）

### 安全保证

✅ **允许的操作**：
- 读取 Sprint 和 Story 信息
- 生成本地文档
- 添加评论到 Story

❌ **禁止的操作**：
- 更新 Story 字段（标题、描述、状态等）
- 删除 Story
- 修改 Sprint
- 删除评论

**注意**：本 MCP 服务器设计为只读 + 评论模式，确保 JIRA 数据安全。

## 安装

1. 安装依赖：

```bash
cd .kiro/mcp-servers/jira-server
npm install
```

2. 配置环境变量：

在项目根目录创建 `.env` 文件（或在系统环境变量中设置）：

```bash
JIRA_URL=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token
JIRA_BOARD_ID=123
FIGMA_ACCESS_TOKEN=your-figma-personal-access-token
```

### 获取 Figma Personal Access Token

1. 登录 Figma，点击右上角头像 → Settings
2. 左侧选择 Security → Personal access tokens
3. 点击 Generate new token，复制 token

### 获取 JIRA API Token

1. 访问 https://id.atlassian.com/manage-profile/security/api-tokens
2. 点击 "Create API token"
3. 复制生成的 token

### 获取 Board ID

从 JIRA Board URL 中获取：
```
https://your-company.atlassian.net/secure/RapidBoard.jspa?rapidView=123
                                                                    ^^^
                                                                Board ID
```

## 使用方法

在 comate 中直接使用自然语言命令：

### 1. 列出 Sprint

```
列出所有活跃的 Sprint
列出已完成的 Sprint
```

### 2. 查看 Sprint Story

```
获取 PI 17 Sprint 2 的所有 Story
查看 Sprint "PI 17 Sprint 2" 的 Story 列表
```

### 3. 同步 Sprint 到文档

```
同步 Sprint 17.2 到文档
将 PI 17 Sprint 2 的 Story 同步到本地文档
```

这会自动生成 `docs/iterations/sprint-17.2.md` 文件。

### 4. 查看 Story 详情

```
获取 Story PROJ-123 的详细信息
查看 PROJ-456 的详情
```

### 5. 给 Story 添加评论

```
给 Story CARCN-24500 添加评论：技术方案已更新
在 CARCN-24476 中添加评论：使用虚拟滚动优化性能
```

这会在 JIRA Story 中添加评论，方便团队协作和信息同步。

### 6. 生成 Epic PRD 文档

```
生成 Epic CARCN-12345 的 PRD 文档
为 Epic CARCN-23456 创建产品需求文档
```

### 7. 同步 Sprint Figma 设计稿

```
同步 Sprint 17.7 的 Figma 设计稿
获取 Phoenix It.17.7 所有 Story 的设计图
```

这会自动：
- 扫描 Sprint 所有 Story 的 description，提取 Figma 链接
- 识别链接中 focus 的 page/frame，只导出相关设计稿
- 将图片保存到 `docs/iterations/sprint-{PI}.{Sprint}/assets/` 统一资源目录
- 生成 `assets/README.md` 作为图片索引，各 Story 文档可直接引用

这会自动：
- 获取 Epic 下的所有 Story
- 统计工作量（FE/BE/QA/Native）
- 识别涉及的项目
- 生成完整的 PRD 文档到 `docs/prd/{EPIC_KEY}-PRD.md`

PRD 文档包含：
- Epic 概述和背景
- 功能需求列表（所有 Story）
- 非功能需求框架
- 技术方案框架
- 实施计划和进度
- 风险与依赖
- 验收标准

## 可用工具

### list_sprints
列出所有 Sprint

参数：
- `state` (可选): Sprint 状态 - active, future, closed

示例：
```javascript
{
  "state": "active"  // 或 "future", "closed"
}
```

### get_sprint_stories
获取指定 Sprint 的所有 Story

参数：
- `sprint_name` (必需): Sprint 名称，例如 "PI 17 Sprint 2"

示例：
```javascript
{
  "sprint_name": "Phoenix It.17.6"
}
```

### sync_sprint_to_doc
同步 Sprint Story 到本地文档

参数：
- `pi` (必需): PI 编号，例如 "17"
- `sprint` (必需): Sprint 编号，例如 "6"
- `sprint_name` (必需): JIRA 中的 Sprint 名称，例如 "Phoenix It.17.6"

示例：
```javascript
{
  "pi": "17",
  "sprint": "6",
  "sprint_name": "Phoenix It.17.6"
}
```

生成的文档会包含：
- Sprint 基本信息（周期、目标、工作量统计）
- 所有 Story 的详细信息
- 智能推断的涉及项目
- 子任务列表

### get_story_details
获取指定 Story 的详细信息

参数：
- `story_key` (必需): Story Key，例如 "CARCN-24500"

示例：
```javascript
{
  "story_key": "CARCN-24500"
}
```

### add_story_comment
给 Story 添加评论

参数：
- `story_key` (必需): Story Key，例如 "CARCN-24500"
- `comment` (必需): 评论内容

示例：
```javascript
{
  "story_key": "CARCN-24500",
  "comment": "技术方案已更新，使用虚拟滚动优化性能"
}
```

### generate_epic_prd
根据 Epic 编号生成 PRD（产品需求文档）

参数：
- `epic_key` (必需): Epic Key，例如 "CARCN-12345"

### sync_sprint_figma_designs
获取 Sprint 所有 Story 的 Figma 设计稿并保存到本地

参数：
- `pi` (必需): PI 编号，例如 "17"
- `sprint` (必需): Sprint 编号，例如 "7"
- `sprint_name` (必需): JIRA 中的 Sprint 名称，例如 "Phoenix It.17.7"

生成结果：
```
docs/iterations/sprint-17.7/
├── assets/                              ← 统一资源目录
│   ├── README.md                        ← 图片索引
│   ├── CARCN-24500-Page-1-首页.png
│   ├── CARCN-24500-Page-1-详情页.png
│   └── CARCN-24501-Mobile-弹窗.png
├── CARCN-24500.md                       ← 引用: ![首页](./assets/CARCN-24500-Page-1-首页.png)
└── CARCN-24501.md
```

Story 文档中引用图片的方式：
```markdown
![设计稿](./assets/CARCN-24500-Page-1-首页.png)
```

示例：
```javascript
{
  "epic_key": "CARCN-12345"
}
```

生成的 PRD 文档会包含：
- Epic 概述（背景、目标、范围）
- 工作量统计（FE/BE/QA/Native 点数）
- 涉及项目列表
- 所有 Story 的详细需求
- Story 列表表格（Key、标题、状态、优先级、负责人）
- 非功能需求框架
- 技术方案框架
- 实施计划和进度统计
- 风险与依赖
- 验收标准

文档保存位置：`docs/prd/{EPIC_KEY}-PRD.md`

## 智能项目推断

本 MCP 服务器会根据以下规则自动推断 Story 涉及的项目：

### 推断规则

1. **标题标记**：
   - `[OMA]` → miniprogram（小程序）
   - `[MPA]` 或 `[APP]` → h5-web（H5）
   - 注：原生 iOS/Android 不在当前项目范围内

2. **工作量标记**：
   - `FE` + 数字（如 FE2）→ 需要前端项目
   - `BE` + 数字（如 BE2）→ 需要后端项目
   - `QA` + 数字（如 QA1）→ 需要测试工作

3. **后端项目判断**：
   - 包含 "管理"、"后台"、"B端" 等关键词 → management-layer（B端后端）
   - 其他情况 → business-layer（C端后端）

4. **前端项目判断**：
   - 根据 `[OMA]` 或 `[MPA]` 标记确定具体前端项目
   - 如果只有 `FE` 标记但无明确触点，会根据描述内容推断

5. **标签映射**（作为补充）：
   - `miniprogram` → miniprogram（小程序）
   - `h5` → h5-web（H5）
   - `management` → finder-management（管理端）

### 示例

```
标题: [OMA] 用户登录优化 FE2 BE1
推断结果:
- miniprogram（小程序）- 因为有 [OMA] 标记
- business-layer（C端后端）- 因为有 BE 工作量且非管理相关

标题: [MPA] 管理端数据导出 FE3 BE2
推断结果:
- h5-web（H5）- 因为有 [MPA] 标记
- management-layer（B端后端）- 因为有 BE 工作量且包含"管理"关键词
```

## 配置说明

MCP 配置文件位于 `.kiro/settings/mcp.json`：

```json
{
  "mcpServers": {
    "jira": {
      "command": "node",
      "args": [".kiro/mcp-servers/jira-server/index.js"],
      "env": {
        "JIRA_URL": "${JIRA_URL}",
        "JIRA_EMAIL": "${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}",
        "JIRA_BOARD_ID": "${JIRA_BOARD_ID}"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## 故障排除

### 连接失败

检查：
1. JIRA URL 是否正确（不要包含 https://）
2. API Token 是否有效
3. 邮箱地址是否正确
4. Board ID 是否正确

### 找不到 Sprint

确保 Sprint 名称与 JIRA 中的完全一致，包括大小写和空格。

### 权限问题

确保你的 JIRA 账号有权限访问对应的 Board 和 Sprint。

## 自定义

你可以修改 `index.js` 中的以下函数来自定义行为：

- `generateSprintDoc()` - 自定义文档格式
- `formatStory()` - 自定义 Story 格式
- `inferProjectsFromStory()` - 自定义项目推断规则
- `extractTextFromDescription()` - 自定义描述文本提取逻辑

## 技术细节

### JIRA API 版本

本服务器使用 JIRA REST API v3：
- 搜索端点: `/rest/api/3/search`
- 评论端点: `/rest/api/3/issue/{issueKey}/comment`
- 认证方式: Basic Auth (email + API token)

### 数据格式

JIRA 使用 Atlassian Document Format (ADF) 存储富文本内容。本服务器会自动将 ADF 转换为纯文本用于文档生成。

## 更新日志

- 2026-02-20: 添加 Epic PRD 文档生成功能
- 2026-02-19: 添加评论功能、智能项目推断、完善文档
- 2026-02-15: 初始版本，支持读取 Sprint 和 Story
