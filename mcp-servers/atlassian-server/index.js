#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载 .env 文件（同目录下）
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env');

if (await fs.access(envPath).then(() => true).catch(() => false)) {
  const envContent = await fs.readFile(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    // 去掉首尾成对的引号（含中文智能引号 “ ” ‘ ’），避免粘贴 token 时引入非法字符
    const value = trimmed
      .slice(eqIndex + 1)
      .trim()
      .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '');
    // 环境变量优先级高于 .env 文件（MCP 传入的 env 不被覆盖）
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Atlassian 配置（JIRA + Confluence 共享同一套认证）
const ATLASSIAN_HOST = process.env.ATLASSIAN_HOST?.replace('https://', '') || '';
const ATLASSIAN_EMAIL = process.env.ATLASSIAN_EMAIL || '';
const ATLASSIAN_API_TOKEN = process.env.ATLASSIAN_API_TOKEN || '';
const BOARD_IDS = {
  phoenix: process.env.JIRA_BOARD_ID_PHOENIX || '',
  carsales: process.env.JIRA_BOARD_ID_CARSALES || '',
  titan: process.env.JIRA_BOARD_ID_TITAN || '',
  rocket: process.env.JIRA_BOARD_ID_ROCKET || '',
  sst: process.env.JIRA_BOARD_ID_SST || '',
};
const BOARD_ID = BOARD_IDS.phoenix;

// 启动时校验必填配置
const requiredConfigs = [
  ['ATLASSIAN_HOST', ATLASSIAN_HOST],
  ['ATLASSIAN_EMAIL', ATLASSIAN_EMAIL],
  ['ATLASSIAN_API_TOKEN', ATLASSIAN_API_TOKEN],
];
const missing = requiredConfigs.filter(([, v]) => !v).map(([k]) => k);
if (missing.length > 0) {
  console.error(`❌ 缺少必填配置: ${missing.join(', ')}`);
  console.error(`   请复制 .env.example 为 .env 并填写配置: cp ${envPath.replace(/\/[^/]+$/, '/.env.example')} ${envPath}`);
  process.exit(1);
}

// 创建 Basic Auth header
const auth = Buffer.from(`${ATLASSIAN_EMAIL}:${ATLASSIAN_API_TOKEN}`).toString('base64');
const headers = {
  'Authorization': `Basic ${auth}`,
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

// JIRA API 请求封装
async function jiraRequest(endpoint, options = {}, apiType = 'api') {
  // apiType 可以是 'api' (v3) 或 'agile' (v1.0)
  const baseUrl = apiType === 'agile' 
    ? `https://${ATLASSIAN_HOST}/rest/agile/1.0`
    : `https://${ATLASSIAN_HOST}/rest/api/3`;
  
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`JIRA API Error: ${response.status} - ${error}`);
  }

  // 204 No Content（如 PUT 更新）或空响应体不走 JSON 解析，避免 "Unexpected end of JSON input"
  if (response.status === 204) return {};
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

// 创建 MCP Server
const server = new Server(
  {
    name: 'atlassian-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 工具列表
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_sprints',
        description: '列出所有 Sprint',
        inputSchema: {
          type: 'object',
          properties: {
            state: {
              type: 'string',
              description: 'Sprint 状态: active, future, closed',
              enum: ['active', 'future', 'closed']
            },
            board: {
              type: 'string',
              description: '看板名称: phoenix(CARCN,默认)、carsales(CARTS) 或 titan',
              enum: ['phoenix', 'rocket', 'sst', 'carsales', 'titan']
            }
          }
        }
      },
      {
        name: 'get_sprint_stories',
        description: '获取指定 Sprint 的所有 Story',
        inputSchema: {
          type: 'object',
          properties: {
            sprint_name: {
              type: 'string',
              description: 'Sprint 名称，例如: PI 17 Sprint 2'
            },
            board: {
              type: 'string',
              description: '看板名称: phoenix(CARCN,默认)、carsales(CARTS) 或 titan',
              enum: ['phoenix', 'rocket', 'sst', 'carsales', 'titan']
            }
          },
          required: ['sprint_name']
        }
      },
      {
        name: 'search_issues',
        description: '用 JQL 自由查询 JIRA Issue',
        inputSchema: {
          type: 'object',
          properties: {
            jql: {
              type: 'string',
              description: 'JQL 查询语句，例如: project = CARTS AND assignee = currentUser()'
            },
            max_results: {
              type: 'number',
              description: '最多返回条数，默认 50'
            }
          },
          required: ['jql']
        }
      },
      {
        name: 'sync_sprint_to_doc',
        description: '同步 Sprint Story 到本地文档',
        inputSchema: {
          type: 'object',
          properties: {
            pi: {
              type: 'string',
              description: 'PI 编号，例如: 17'
            },
            sprint: {
              type: 'string',
              description: 'Sprint 编号，例如: 2'
            },
            sprint_name: {
              type: 'string',
              description: 'JIRA 中的 Sprint 名称，例如: PI 17 Sprint 2'
            }
          },
          required: ['pi', 'sprint', 'sprint_name']
        }
      },
      {
        name: 'get_story_details',
        description: '获取指定 Story 的详细信息',
        inputSchema: {
          type: 'object',
          properties: {
            story_key: {
              type: 'string',
              description: 'Story Key，例如: PROJ-123'
            }
          },
          required: ['story_key']
        }
      },
      {
        name: 'add_story_comment',
        description: '给 Story 添加评论（例如：同步技术方案到 JIRA）',
        inputSchema: {
          type: 'object',
          properties: {
            story_key: {
              type: 'string',
              description: 'Story Key，例如: PROJ-123'
            },
            comment: {
              type: 'string',
              description: '评论内容，支持 Markdown 格式'
            }
          },
          required: ['story_key', 'comment']
        }
      },
      {
        name: 'get_team_members',
        description: '从历史 Sprint 中获取团队成员列表',
        inputSchema: {
          type: 'object',
          properties: {
            max_results: {
              type: 'number',
              description: '最多查询多少个 Story（默认 200）',
              default: 200
            }
          }
        }
      },
      {
        name: 'generate_epic_prd',
        description: '根据 Epic 编号生成 PRD 文档（返回原始数据，由 AI 分析生成完整 PRD）',
        inputSchema: {
          type: 'object',
          properties: {
            epic_key: {
              type: 'string',
              description: 'Epic Key，例如: CARCN-12345'
            }
          },
          required: ['epic_key']
        }
      },
      {
        name: 'sync_sprint_figma_designs',
        description: '获取 Sprint 所有 Story 中的 Figma 设计稿，保存到 Sprint assets 文件夹',
        inputSchema: {
          type: 'object',
          properties: {
            pi: {
              type: 'string',
              description: 'PI 编号，例如: 17'
            },
            sprint: {
              type: 'string',
              description: 'Sprint 编号，例如: 7'
            },
            sprint_name: {
              type: 'string',
              description: 'JIRA 中的 Sprint 名称，例如: Phoenix It.17.7'
            }
          },
          required: ['pi', 'sprint', 'sprint_name']
        }
      },
      // Confluence 工具
      {
        name: 'confluence_search',
        description: '搜索 Confluence 页面，支持 CQL 查询语法',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '搜索关键词或 CQL 查询，例如: "API 文档" 或 space=PROJ AND title~"设计"'
            },
            space_key: {
              type: 'string',
              description: 'Confluence Space Key，留空则搜索所有 Space'
            },
            limit: {
              type: 'number',
              description: '返回结果数量，默认 10',
              default: 10
            }
          },
          required: ['query']
        }
      },
      {
        name: 'confluence_get_page',
        description: '获取 Confluence 页面的完整内容',
        inputSchema: {
          type: 'object',
          properties: {
            page_id: {
              type: 'string',
              description: 'Confluence 页面 ID（数字），可从页面 URL 中获取'
            }
          },
          required: ['page_id']
        }
      },
      {
        name: 'confluence_get_space_pages',
        description: '获取指定 Confluence Space 下的页面列表',
        inputSchema: {
          type: 'object',
          properties: {
            space_key: {
              type: 'string',
              description: 'Space Key，例如: PROJ'
            },
            limit: {
              type: 'number',
              description: '返回数量，默认 20',
              default: 20
            }
          },
          required: ['space_key']
        }
      },
      {
        name: 'confluence_create_page',
        description: '在 Confluence 中创建新页面',
        inputSchema: {
          type: 'object',
          properties: {
            space_key: {
              type: 'string',
              description: 'Space Key，例如: PROJ'
            },
            title: {
              type: 'string',
              description: '页面标题'
            },
            content: {
              type: 'string',
              description: '页面内容，支持 Markdown（会自动转换为 Confluence storage format）'
            },
            parent_id: {
              type: 'string',
              description: '父页面 ID（可选），不填则创建在 Space 根目录'
            }
          },
          required: ['space_key', 'title', 'content']
        }
      },
      {
        name: 'download_attachment',
        description: '下载 JIRA 附件到本地',
        inputSchema: {
          type: 'object',
          properties: {
            story_key: {
              type: 'string',
              description: 'Story Key，例如: PROJ-123'
            },
            save_dir: {
              type: 'string',
              description: '保存目录，例如: docs/iterations/sprint-18.4/assets'
            },
            attachment_index: {
              type: 'number',
              description: '附件索引（默认下载第一个），从 0 开始'
            }
          },
          required: ['story_key', 'save_dir']
        }
      },
      {
        name: 'jira_create_issue',
        description: '创建 JIRA Issue（如 Feature/Story）。description 可传纯文本/Markdown（自动转 ADF）或直接传 ADF 对象；fields 为透传字段对象，可写入自定义字段（PI=customfield_18207、Technical Description=customfield_18215、估算 customfield_11101~11105、总计 customfield_18330 等）。',
        inputSchema: {
          type: 'object',
          properties: {
            project_key: { type: 'string', description: '项目键：CARTS(默认) 或 CARCN' },
            issue_type: { type: 'string', description: 'Issue 类型，默认 Feature' },
            summary: { type: 'string', description: 'Issue 标题' },
            description: { type: ['string', 'object'], description: '描述。字符串走 Markdown→ADF；对象按 ADF 原样写入' },
            fields: { type: 'object', description: '透传到 fields 的对象，用于自定义字段/Epic 链接等（与上面参数合并，优先级最高）' }
          },
          required: ['summary']
        }
      },
      {
        name: 'jira_update_issue',
        description: '更新 JIRA Issue 字段。description 可传文本(自动 ADF)或 ADF 对象；fields 为透传字段对象。',
        inputSchema: {
          type: 'object',
          properties: {
            issue_key: { type: 'string', description: 'Issue Key，例如 CARTS-1234' },
            description: { type: ['string', 'object'], description: '可选，新的描述' },
            fields: { type: 'object', description: '要更新的 fields 对象（与 description 合并）' }
          },
          required: ['issue_key']
        }
      },
      {
        name: 'jira_link_to_epic',
        description: '把 Issue 关联到 Epic（写入 parent 父级关系）。',
        inputSchema: {
          type: 'object',
          properties: {
            issue_key: { type: 'string', description: 'Issue Key，例如 CARTS-1234' },
            epic_key: { type: 'string', description: 'Epic Key，例如 CARTS-3177' }
          },
          required: ['issue_key', 'epic_key']
        }
      },
      {
        name: 'jira_create_issue_link',
        description: '在两个 Issue 之间建立关联（用于依赖关系，如同名不同后缀条目）。',
        inputSchema: {
          type: 'object',
          properties: {
            inward_issue: { type: 'string', description: '内向 Issue Key（如被依赖方）' },
            outward_issue: { type: 'string', description: '外向 Issue Key（如依赖方）' },
            link_type: { type: 'string', description: '关联类型名称，默认 Relates（其他如 Blocks、Depends）' }
          },
          required: ['inward_issue', 'outward_issue']
        }
      },
      {
        name: 'jira_search_fields',
        description: '按名称模糊查询 JIRA 字段，返回字段 id/name/是否自定义，用于定位 BO、团队等自定义字段的 customfield id。',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: '字段名关键字，例如：业务负责人 / Team / PI。留空返回全部' }
          }
        }
      }
    ]
  };
});

// 工具执行
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_sprints':
        return await listSprints(args.state, args.board);
      
      case 'search_issues':
        return await searchIssues(args.jql, args.max_results);

      case 'get_sprint_stories':
        return await getSprintStories(args.sprint_name, args.board);
      
      case 'sync_sprint_to_doc':
        return await syncSprintToDoc(args.pi, args.sprint, args.sprint_name);
      
      case 'get_story_details':
        return await getStoryDetails(args.story_key);
      
      case 'add_story_comment':
        return await addStoryComment(args.story_key, args.comment);
      
      case 'get_team_members':
        return await getTeamMembers(args.max_results || 200);
      
      case 'generate_epic_prd':
        return await generateEpicPRD(args.epic_key);
      
      case 'sync_sprint_figma_designs':
        return await syncSprintFigmaDesigns(args.pi, args.sprint, args.sprint_name);
      
      // Confluence
      case 'confluence_search':
        return await confluenceSearch(args.query, args.space_key, args.limit || 10);
      
      case 'confluence_get_page':
        return await confluenceGetPage(args.page_id);
      
      case 'confluence_get_space_pages':
        return await confluenceGetSpacePages(args.space_key, args.limit || 20);
      
      case 'confluence_create_page':
        return await confluenceCreatePage(args.space_key, args.title, args.content, args.parent_id);

      case 'download_attachment':
        return await downloadAttachment(args.story_key, args.save_dir, args.attachment_index);

      // 写操作
      case 'jira_create_issue':
        return await jiraCreateIssue(args.project_key, args.issue_type, args.summary, args.description, args.fields);

      case 'jira_update_issue':
        return await jiraUpdateIssue(args.issue_key, args.description, args.fields);

      case 'jira_link_to_epic':
        return await jiraLinkToEpic(args.issue_key, args.epic_key);

      case 'jira_create_issue_link':
        return await jiraCreateIssueLink(args.inward_issue, args.outward_issue, args.link_type);

      case 'jira_search_fields':
        return await jiraSearchFields(args.query);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Error in tool ${name}:`, error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}\n\nStack: ${error.stack}`
        }
      ]
    };
  }
});

// 自由 JQL 查询
async function searchIssues(jql, maxResults = 50) {
  const issues = await jiraRequest(
    `/search/jql?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=summary,description,status,priority,assignee,reporter,labels,subtasks,issuetype,customfield_10016,customfield_10014`,
  );

  const results = issues.issues.map(issue => ({
    key: issue.key,
    type: issue.fields.issuetype?.name || 'Unknown',
    summary: issue.fields.summary,
    status: issue.fields.status.name,
    priority: issue.fields.priority?.name || '中',
    assignee: issue.fields.assignee?.displayName || '未分配',
    reporter: issue.fields.reporter?.displayName || '未知',
    labels: issue.fields.labels || [],
  }));

  return {
    content: [{ type: 'text', text: JSON.stringify(results, null, 2) }]
  };
}

// 列出 Sprint
async function listSprints(state = 'active', board = 'phoenix') {
  const boardId = BOARD_IDS[board] || BOARD_ID;
  const sprints = await jiraRequest(`/board/${boardId}/sprint?state=${state}&maxResults=50`, {}, 'agile');
  
  const sprintList = sprints.values.map(sprint => ({
    id: sprint.id,
    name: sprint.name,
    state: sprint.state,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    goal: sprint.goal
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(sprintList, null, 2)
      }
    ]
  };
}

// 获取 Sprint 的 Story
async function getSprintStories(sprintName, board = 'phoenix') {
  const jql = `sprint = "${sprintName}" AND type not in (Sub-task) ORDER BY priority DESC`;
  const issues = await jiraRequest(`/search/jql?jql=${encodeURIComponent(jql)}&maxResults=100&fields=summary,description,status,priority,assignee,reporter,labels,subtasks,issuetype`);

  const stories = issues.issues.map(issue => ({
    key: issue.key,
    type: issue.fields.issuetype?.name || 'Unknown',
    summary: issue.fields.summary,
    description: issue.fields.description || '',
    status: issue.fields.status.name,
    priority: issue.fields.priority?.name || '中',
    assignee: issue.fields.assignee?.displayName || '未分配',
    reporter: issue.fields.reporter?.displayName || '未知',
    labels: issue.fields.labels || [],
    subtasks: issue.fields.subtasks?.map(st => ({
      key: st.key,
      summary: st.fields.summary,
      status: st.fields.status.name
    })) || []
  }));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(stories, null, 2)
      }
    ]
  };
}

// 同步 Sprint 到文档
async function syncSprintToDoc(pi, sprint, sprintName) {
  // 获取 Sprint 信息 - 使用 agile API
  const sprints = await jiraRequest(`/agile/1.0/board/${BOARD_ID}/sprint?state=active,future,closed&maxResults=100`, {}, 'agile');
  const sprintInfo = sprints.values.find(s => s.name === sprintName);
  
  if (!sprintInfo) {
    throw new Error(`Sprint "${sprintName}" not found`);
  }

  // 获取 Stories（包含 Story、Technical Story、Task 等，排除 Sub-task）
  const jql = `sprint = "${sprintName}" AND type not in (Sub-task) ORDER BY priority DESC`;
  const issues = await jiraRequest(`/search/jql?jql=${encodeURIComponent(jql)}&maxResults=100&fields=summary,description,status,priority,assignee,labels,subtasks,issuetype`);

  // 生成文档内容
  const doc = generateSprintDoc(pi, sprint, sprintInfo, issues.issues);

  // 保存文档
  const filename = `docs/iterations/sprint-${pi}.${sprint}.md`;
  await fs.writeFile(filename, doc, 'utf-8');

  return {
    content: [
      {
        type: 'text',
        text: `✅ Sprint 文档已生成: ${filename}\n\n共同步 ${issues.issues.length} 个 Story`
      }
    ]
  };
}

// 获取 Story 详情
async function getStoryDetails(storyKey) {
  const issue = await jiraRequest(`/issue/${storyKey}?fields=summary,description,status,priority,assignee,reporter,created,updated,labels,components,subtasks,comment,issuetype,customfield_11101,customfield_11102,customfield_11103,customfield_11104,customfield_11105,customfield_18330,customfield_18248,attachment`);

  const details = {
    key: issue.key,
    type: issue.fields.issuetype?.name || 'Unknown',
    summary: issue.fields.summary,
    description: issue.fields.description || '',
    status: issue.fields.status.name,
    priority: issue.fields.priority?.name || '中',
    assignee: issue.fields.assignee?.displayName || '未分配',
    reporter: issue.fields.reporter?.displayName || '',
    created: issue.fields.created,
    updated: issue.fields.updated,
    labels: issue.fields.labels || [],
    components: issue.fields.components?.map(c => c.name) || [],
    touchpoint: issue.fields.customfield_18248?.map(t => t.value) || [],
    attachments: (issue.fields.attachment || []).map(a => ({
      id: a.id,
      filename: a.filename,
      mimeType: a.mimeType,
      size: a.size,
      content: a.content,  // 下载 URL
      created: a.created,
      author: a.author?.displayName || ''
    })),
    subtasks: issue.fields.subtasks?.map(st => ({
      key: st.key,
      summary: st.fields.summary,
      status: st.fields.status.name,
      assignee: st.fields.assignee?.displayName || '未分配'
    })) || [],
    comments: (issue.fields.comment?.comments || []).map(c => ({
      author: c.author?.displayName || '',
      created: c.created,
      body: extractTextFromDescription(c.body)
    })),
    estimation: {
      be: issue.fields.customfield_11101 ?? null,
      fe: issue.fields.customfield_11102 ?? null,
      qa: issue.fields.customfield_11103 ?? null,
      ios: issue.fields.customfield_11104 ?? null,
      android: issue.fields.customfield_11105 ?? null,
      total: issue.fields.customfield_18330 ?? null
    }
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(details, null, 2)
      }
    ]
  };
}

// 给 Story 添加评论
async function addStoryComment(storyKey, comment) {
  // JIRA API v3 添加评论的格式
  const commentBody = {
    body: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: comment
            }
          ]
        }
      ]
    }
  };

  await jiraRequest(`/issue/${storyKey}/comment`, {
    method: 'POST',
    body: JSON.stringify(commentBody)
  });

  return {
    content: [
      {
        type: 'text',
        text: `✅ 成功给 Story ${storyKey} 添加评论`
      }
    ]
  };
}

// ============ 写操作：创建 / 更新 / 关联 ============

const PROJECT_KEY_ALIASES = { carsales: 'CARTS', phoenix: 'CARCN' };

// 富文本自定义字段：传入字符串时自动转 ADF（Jira 富文本字段只接受 ADF，例如 Technical Description）
const ADF_TEXT_FIELDS = ['customfield_18215'];

function coerceAdfFields(fields, extraIds = []) {
  for (const fid of [...ADF_TEXT_FIELDS, ...extraIds]) {
    if (typeof fields[fid] === 'string') fields[fid] = markdownToADF(fields[fid]);
  }
}

// 把简单 Markdown 文本转成 Jira ADF(doc)。支持 **加粗**、- 无序列表、• 段落、空行分段。
// 传入对象时视为已是 ADF，原样返回。
function markdownToADF(input) {
  if (input && typeof input === 'object') return input;
  const lines = String(input ?? '').split('\n');
  const content = [];
  let listBuffer = null;

  const flushList = () => {
    if (listBuffer && listBuffer.length) content.push({ type: 'bulletList', content: listBuffer });
    listBuffer = null;
  };

  // 行内 **加粗** -> ADF text 节点
  const inline = (s) => {
    const nodes = [];
    for (const p of s.split(/(\*\*[^*]+\*\*)/g)) {
      if (!p) continue;
      const m = p.match(/^\*\*([^*]+)\*\*$/);
      if (m) nodes.push({ type: 'text', text: m[1], marks: [{ type: 'strong' }] });
      else nodes.push({ type: 'text', text: p });
    }
    return nodes.length ? nodes : [{ type: 'text', text: ' ' }];
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) { flushList(); continue; }

    const li = trimmed.match(/^[-*]\s+(.*)$/);
    if (li) {
      if (!listBuffer) listBuffer = [];
      listBuffer.push({ type: 'listItem', content: [{ type: 'paragraph', content: inline(li[1]) }] });
      continue;
    }

    flushList();
    content.push({ type: 'paragraph', content: inline(trimmed.replace(/^•\s*/, '')) });
  }
  flushList();

  if (!content.length) content.push({ type: 'paragraph', content: [{ type: 'text', text: ' ' }] });
  return { type: 'doc', version: 1, content };
}

// 创建 Issue（Feature/Story 等）
async function jiraCreateIssue(projectKey = 'CARTS', issueType = 'Feature', summary, description, extraFields = {}) {
  if (!summary) throw new Error('summary 必填');
  const key = PROJECT_KEY_ALIASES[String(projectKey || '').toLowerCase()] || projectKey || 'CARTS';
  const fields = {
    project: { key },
    issuetype: { name: issueType || 'Feature' },
    summary,
  };
  if (description !== undefined && description !== null) fields.description = markdownToADF(description);
  Object.assign(fields, extraFields || {});
  coerceAdfFields(fields, Array.isArray(extraFields?.adf_fields) ? extraFields.adf_fields : []);
  delete fields.adf_fields;

  const res = await jiraRequest('/issue', { method: 'POST', body: JSON.stringify({ fields }) });
  const url = `https://${ATLASSIAN_HOST}/browse/${res.key}`;
  return {
    content: [{ type: 'text', text: JSON.stringify({ ok: true, key: res.key, id: res.id, url }, null, 2) }]
  };
}

// 更新 Issue 字段
async function jiraUpdateIssue(issueKey, description, extraFields = {}) {
  if (!issueKey) throw new Error('issue_key 必填');
  const fields = { ...(extraFields || {}) };
  if (description !== undefined && description !== null) fields.description = markdownToADF(description);
  coerceAdfFields(fields, Array.isArray(fields.adf_fields) ? fields.adf_fields : []);
  delete fields.adf_fields;
  if (!Object.keys(fields).length) throw new Error('没有要更新的字段');

  await jiraRequest(`/issue/${issueKey}`, { method: 'PUT', body: JSON.stringify({ fields }) });
  return {
    content: [{ type: 'text', text: `✅ 已更新 ${issueKey}（字段：${Object.keys(fields).join(', ')}）` }]
  };
}

// 关联到 Epic（写入 parent 父级关系）
async function jiraLinkToEpic(issueKey, epicKey) {
  if (!issueKey || !epicKey) throw new Error('issue_key 与 epic_key 必填');
  await jiraRequest(`/issue/${issueKey}`, {
    method: 'PUT',
    body: JSON.stringify({ fields: { parent: { key: epicKey } } })
  });
  return {
    content: [{ type: 'text', text: `✅ 已将 ${issueKey} 关联到 Epic ${epicKey}` }]
  };
}

// 在两个 Issue 之间建立关联（依赖关系）
async function jiraCreateIssueLink(inwardIssue, outwardIssue, linkType = 'Relates') {
  if (!inwardIssue || !outwardIssue) throw new Error('inward_issue 与 outward_issue 必填');
  const name = linkType || 'Relates';
  await jiraRequest('/issueLink', {
    method: 'POST',
    body: JSON.stringify({
      type: { name },
      inwardIssue: { key: inwardIssue },
      outwardIssue: { key: outwardIssue }
    })
  });
  return {
    content: [{ type: 'text', text: `✅ 已建立关联：${inwardIssue} ${name} ${outwardIssue}` }]
  };
}

// 按名称模糊查询字段，定位 customfield id
async function jiraSearchFields(query) {
  const fields = await jiraRequest('/field');
  const q = String(query || '').toLowerCase();
  const matched = fields
    .filter(f => !q || (f.name && f.name.toLowerCase().includes(q)) || (f.id && f.id.toLowerCase().includes(q)))
    .map(f => ({ id: f.id, name: f.name, custom: !!f.custom, type: f.schema?.type || null }));
  return {
    content: [{ type: 'text', text: JSON.stringify(matched, null, 2) }]
  };
}

// 获取团队成员列表
async function getTeamMembers(maxResults = 200) {
  // 查询最近的 Story，获取所有参与人员
  const jql = `project = CARCN AND type = Story ORDER BY updated DESC`;
  const issues = await jiraRequest(
    `/search/jql?jql=${encodeURIComponent(jql)}&maxResults=${maxResults}&fields=assignee,reporter,subtasks`,
    {}
  );

  // 收集所有成员
  const members = new Map();
  
  issues.issues.forEach(issue => {
    // 收集 assignee
    if (issue.fields.assignee) {
      const assignee = issue.fields.assignee;
      if (!members.has(assignee.accountId)) {
        members.set(assignee.accountId, {
          accountId: assignee.accountId,
          displayName: assignee.displayName,
          emailAddress: assignee.emailAddress || '',
          roles: new Set()
        });
      }
      members.get(assignee.accountId).roles.add('Developer');
    }
    
    // 收集 reporter
    if (issue.fields.reporter) {
      const reporter = issue.fields.reporter;
      if (!members.has(reporter.accountId)) {
        members.set(reporter.accountId, {
          accountId: reporter.accountId,
          displayName: reporter.displayName,
          emailAddress: reporter.emailAddress || '',
          roles: new Set()
        });
      }
      members.get(reporter.accountId).roles.add('Reporter');
    }
    
    // 收集子任务的 assignee
    if (issue.fields.subtasks) {
      issue.fields.subtasks.forEach(subtask => {
        if (subtask.fields && subtask.fields.assignee) {
          const assignee = subtask.fields.assignee;
          if (!members.has(assignee.accountId)) {
            members.set(assignee.accountId, {
              accountId: assignee.accountId,
              displayName: assignee.displayName,
              emailAddress: assignee.emailAddress || '',
              roles: new Set()
            });
          }
          members.get(assignee.accountId).roles.add('Developer');
        }
      });
    }
  });

  // 转换为数组并格式化
  const memberList = Array.from(members.values()).map(member => ({
    displayName: member.displayName,
    emailAddress: member.emailAddress,
    roles: Array.from(member.roles)
  })).sort((a, b) => a.displayName.localeCompare(b.displayName));

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          total: memberList.length,
          members: memberList
        }, null, 2)
      }
    ]
  };
}

// 生成 Epic PRD 文档 - 返回原始数据供 AI 分析
async function generateEpicPRD(epicKey) {
  // 获取 Epic 详情
  const epic = await jiraRequest(`/issue/${epicKey}?fields=summary,description,status,priority,reporter,created,updated,labels,components,issuetype`);
  
  // 检查是否是 Epic 类型
  if (epic.fields.issuetype.name !== 'Epic') {
    throw new Error(`${epicKey} 不是 Epic 类型，而是 ${epic.fields.issuetype.name}`);
  }
  
  // 获取 Epic 下的所有 Story - 使用 parent 字段（JIRA API v3）
  const jql = `parent = ${epicKey} AND type = Story ORDER BY priority DESC, created ASC`;
  const issues = await jiraRequest(
    `/search/jql?jql=${encodeURIComponent(jql)}&maxResults=200&fields=summary,description,status,priority,assignee,reporter,labels,components,subtasks`,
    {}
  );
  
  // 返回原始数据供 AI 分析和生成 PRD
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          epic: {
            key: epic.key,
            summary: epic.fields.summary,
            description: extractTextFromDescription(epic.fields.description),
            status: epic.fields.status.name,
            priority: epic.fields.priority?.name || '中',
            reporter: epic.fields.reporter?.displayName || '未知',
            created: epic.fields.created?.split('T')[0],
            updated: epic.fields.updated?.split('T')[0]
          },
          stories: issues.issues.map(story => ({
            key: story.key,
            summary: story.fields.summary,
            description: extractTextFromDescription(story.fields.description),
            status: story.fields.status.name,
            priority: story.fields.priority?.name || '中',
            assignee: story.fields.assignee?.displayName || '未分配',
            reporter: story.fields.reporter?.displayName || '未知',
            labels: story.fields.labels || [],
            projects: inferProjectsFromStory(story),
            subtasks: story.fields.subtasks?.map(st => ({
              key: st.key,
              summary: st.fields.summary,
              status: st.fields.status.name
            })) || []
          })),
          statistics: {
            total_stories: issues.issues.length,
            fe_points: issues.issues.reduce((sum, s) => {
              const match = s.fields.summary.match(/FE(\d+)/i);
              return sum + (match ? parseInt(match[1]) : 0);
            }, 0),
            be_points: issues.issues.reduce((sum, s) => {
              const match = s.fields.summary.match(/BE(\d+)/i);
              return sum + (match ? parseInt(match[1]) : 0);
            }, 0),
            qa_points: issues.issues.reduce((sum, s) => {
              const match = s.fields.summary.match(/QA(\d+)/i);
              return sum + (match ? parseInt(match[1]) : 0);
            }, 0),
            native_points: issues.issues.reduce((sum, s) => {
              const iosMatch = s.fields.summary.match(/IOS(\d+)/i);
              const androidMatch = s.fields.summary.match(/ANDROID(\d+)/i);
              return sum + (iosMatch ? parseInt(iosMatch[1]) : 0) + (androidMatch ? parseInt(androidMatch[1]) : 0);
            }, 0),
            by_status: {
              done: issues.issues.filter(s => s.fields.status.name === 'Done' || s.fields.status.name === '已完成').length,
              in_progress: issues.issues.filter(s => s.fields.status.name === 'In Progress' || s.fields.status.name === '进行中').length,
              todo: issues.issues.filter(s => s.fields.status.name === 'To Do' || s.fields.status.name === '待办').length
            }
          }
        }, null, 2)
      }
    ]
  };
}

// 生成 PRD 文档内容
function generatePRDDocument(epic, stories) {
  const epicFields = epic.fields;
  const epicDescription = extractTextFromDescription(epicFields.description);
  
  // 提取工作量统计
  const workloadStats = {
    fe: 0,
    be: 0,
    qa: 0,
    native: 0
  };
  
  stories.forEach(story => {
    const summary = story.fields.summary;
    const feMatch = summary.match(/FE(\d+)/i);
    const beMatch = summary.match(/BE(\d+)/i);
    const qaMatch = summary.match(/QA(\d+)/i);
    const iosMatch = summary.match(/IOS(\d+)/i);
    const androidMatch = summary.match(/ANDROID(\d+)/i);
    
    if (feMatch) workloadStats.fe += parseInt(feMatch[1]);
    if (beMatch) workloadStats.be += parseInt(beMatch[1]);
    if (qaMatch) workloadStats.qa += parseInt(qaMatch[1]);
    if (iosMatch) workloadStats.native += parseInt(iosMatch[1]);
    if (androidMatch) workloadStats.native += parseInt(androidMatch[1]);
  });
  
  // 统计涉及的项目
  const involvedProjects = new Set();
  stories.forEach(story => {
    const projects = inferProjectsFromStory(story);
    projects.forEach(p => involvedProjects.add(p));
  });
  
  // 按状态分组 Story
  const storyByStatus = {
    done: stories.filter(s => s.fields.status.name === 'Done' || s.fields.status.name === '已完成'),
    inProgress: stories.filter(s => s.fields.status.name === 'In Progress' || s.fields.status.name === '进行中'),
    todo: stories.filter(s => s.fields.status.name === 'To Do' || s.fields.status.name === '待办'),
    other: stories.filter(s => 
      s.fields.status.name !== 'Done' && 
      s.fields.status.name !== '已完成' &&
      s.fields.status.name !== 'In Progress' && 
      s.fields.status.name !== '进行中' &&
      s.fields.status.name !== 'To Do' && 
      s.fields.status.name !== '待办'
    )
  };
  
  let prd = `# ${epicFields.summary}

> Epic Key: [${epic.key}](https://${ATLASSIAN_HOST}/browse/${epic.key})  
> 创建时间: ${epicFields.created?.split('T')[0] || 'N/A'}  
> 更新时间: ${epicFields.updated?.split('T')[0] || 'N/A'}  
> 状态: ${epicFields.status.name}  
> 优先级: ${epicFields.priority?.name || '中'}  
> 产品负责人: ${epicFields.reporter?.displayName || '未指定'}

---

## 1. 概述

### 1.1 背景

${epicDescription || '待补充背景信息'}

### 1.2 目标

- 待补充具体目标

### 1.3 范围

**涉及项目**:
${Array.from(involvedProjects).map(p => `- ${p}`).join('\n') || '- 待确认'}

**工作量评估**:
- 前端开发: ${workloadStats.fe} 点
- 后端开发: ${workloadStats.be} 点
- 测试: ${workloadStats.qa} 点
- 原生开发: ${workloadStats.native} 点
- **总计**: ${workloadStats.fe + workloadStats.be + workloadStats.qa + workloadStats.native} 点

---

## 2. 功能需求

### 2.1 Story 列表

本 Epic 包含 ${stories.length} 个 Story：

| Story Key | 标题 | 状态 | 优先级 | 负责人 |
|-----------|------|------|--------|--------|
${stories.map(s => `| [${s.key}](https://${ATLASSIAN_HOST}/browse/${s.key}) | ${s.fields.summary} | ${s.fields.status.name} | ${s.fields.priority?.name || '中'} | ${s.fields.assignee?.displayName || '未分配'} |`).join('\n')}

### 2.2 功能详情

`;

  // 按 Story 生成详细需求
  stories.forEach((story, index) => {
    const storyDesc = extractTextFromDescription(story.fields.description);
    const projects = inferProjectsFromStory(story);
    
    prd += `#### ${index + 1}. ${story.fields.summary}

**Story Key**: [${story.key}](https://${ATLASSIAN_HOST}/browse/${story.key})  
**优先级**: ${story.fields.priority?.name || '中'}  
**状态**: ${story.fields.status.name}  
**负责人**: ${story.fields.assignee?.displayName || '未分配'}  
**涉及项目**: ${projects.join(', ') || '待确认'}

**需求描述**:

${storyDesc || '待补充需求描述'}

`;

    // 如果有子任务，列出子任务
    if (story.fields.subtasks && story.fields.subtasks.length > 0) {
      prd += `**子任务**:\n`;
      story.fields.subtasks.forEach(subtask => {
        prd += `- [${subtask.fields.status.name === 'Done' ? 'x' : ' '}] ${subtask.fields.summary} (${subtask.key})\n`;
      });
      prd += '\n';
    }
    
    prd += '---\n\n';
  });

  prd += `## 3. 非功能需求

### 3.1 性能要求

- 待补充性能指标

### 3.2 安全要求

- 待补充安全要求

### 3.3 兼容性要求

- 待补充兼容性要求

---

## 4. 技术方案

### 4.1 架构设计

待补充架构设计

### 4.2 技术栈

参考项目技术栈：
- 前端：Taro + React + TypeScript / Vite + React + TypeScript
- 后端：Spring Boot + Java + MySQL + Redis

### 4.3 关键技术点

待补充关键技术点

---

## 5. 实施计划

### 5.1 进度概览

- **总 Story 数**: ${stories.length}
- **已完成**: ${storyByStatus.done.length}
- **进行中**: ${storyByStatus.inProgress.length}
- **待开始**: ${storyByStatus.todo.length}
- **其他状态**: ${storyByStatus.other.length}
- **完成率**: ${stories.length > 0 ? Math.round((storyByStatus.done.length / stories.length) * 100) : 0}%

### 5.2 里程碑

待补充里程碑计划

---

## 6. 风险与依赖

### 6.1 风险识别

待补充风险识别

### 6.2 依赖关系

待补充依赖关系

---

## 7. 验收标准

### 7.1 功能验收

- [ ] 所有 Story 完成开发
- [ ] 所有 Story 通过测试
- [ ] 所有 Story 部署到生产环境

### 7.2 质量验收

- [ ] 代码审查通过
- [ ] 测试覆盖率达标
- [ ] 性能指标达标

---

## 8. 附录

### 8.1 相关文档

- [JIRA Epic](https://${ATLASSIAN_HOST}/browse/${epic.key})
- [项目架构文档](../ARCHITECTURE.md)
- [团队成员](../TEAM.md)

### 8.2 更新记录

- ${new Date().toISOString().split('T')[0]}: PRD 文档初始生成

`;

  return prd;
}

// 生成 Sprint 文档
function generateSprintDoc(pi, sprint, sprintInfo, stories) {
  const startDate = sprintInfo.startDate ? sprintInfo.startDate.split('T')[0] : 'TBD';
  const endDate = sprintInfo.endDate ? sprintInfo.endDate.split('T')[0] : 'TBD';
  const goal = sprintInfo.goal || '待填写';

  let doc = `# Sprint ${pi}.${sprint} - ${sprintInfo.name}

## Sprint 信息

- **PI (Program Increment)**: PI ${pi}
- **Sprint**: Sprint ${sprint}
- **Sprint 周期**: ${startDate} ~ ${endDate}
- **Sprint 目标**: ${goal}
- **参与人员**: 
  - Product Owner: [从 JIRA 获取]
  - Scrum Master: [从 JIRA 获取]
  - 开发团队: [从 JIRA 获取]
- **状态**: ${mapSprintState(sprintInfo.state)}
- **同步时间**: ${new Date().toISOString().split('T')[0]} ${new Date().toTimeString().split(' ')[0]}

## Story 列表

`;

  stories.forEach((story, index) => {
    doc += formatStory(story, index + 1);
  });

  const completed = stories.filter(s => s.fields.status.name === 'Done' || s.fields.status.name === '已完成').length;
  const completionRate = stories.length > 0 ? Math.round((completed / stories.length) * 100) : 0;

  doc += `
## 技术债务

记录本 Sprint 发现的技术债务：

1. **债务描述**: [描述]
   - 影响: [影响范围]
   - 优先级: 高 / 中 / 低
   - 计划处理时间: [时间]

## Sprint 回顾

### 完成情况

- 计划 Story 数: ${stories.length}
- 完成 Story 数: ${completed}
- 完成率: ${completionRate}%

### 做得好的地方

1. [描述]
2. [描述]

### 需要改进的地方

1. [描述]
2. [描述]

### 行动项

1. [行动项] - 负责人 - 截止日期
2. [行动项] - 负责人 - 截止日期

## 相关文档

- [JIRA Sprint Board](https://${ATLASSIAN_HOST}/secure/RapidBoard.jspa?rapidView=${BOARD_ID})
- [架构文档](../ARCHITECTURE.md)
`;

  return doc;
}

// 格式化 Story
function formatStory(issue, index) {
  const fields = issue.fields;
  const projects = inferProjectsFromStory(issue);
  const projectCheckboxes = projects.length > 0 
    ? projects.map(p => `- [x] ${p}`).join('\n')
    : '- [ ] 待确认';

  const subtasks = fields.subtasks && fields.subtasks.length > 0
    ? fields.subtasks.map(st => {
        const status = st.fields.status.name === 'Done' || st.fields.status.name === '已完成' ? '[x]' : '[ ]';
        return `- ${status} ${st.fields.summary} - ${st.fields.assignee?.displayName || '未分配'}`;
      }).join('\n')
    : '- [ ] 待分解任务';

  return `---

### Story ${index}: [${issue.key}] ${fields.summary}

**JIRA 链接**: [${issue.key}](https://${ATLASSIAN_HOST}/browse/${issue.key})

**优先级**: ${fields.priority?.name || '中'}

**Story 描述**:
${fields.description || '待补充'}

**涉及项目**:
${projectCheckboxes}

**验收标准**:
- [ ] 待补充

**技术方案**:
[待补充技术实现方案]

**任务分解**:
${subtasks}

**依赖关系**:
[待补充依赖描述]

**风险和问题**:
[待补充风险和问题描述]

**状态**: ${fields.status.name}

**负责人**: ${fields.assignee?.displayName || '未分配'}

`;
}

// 映射标签到项目
function mapLabelsToProjects(labels) {
  const projects = [];
  const labelMap = {
    'miniprogram': 'miniprogram（小程序）',
    '小程序': 'miniprogram（小程序）',
    'h5': 'h5-web（H5）',
    'h5-web': 'h5-web（H5）',
    'management': 'finder-management（管理端）',
    '管理端': 'finder-management（管理端）',
    'business': 'business-layer（C端后端）',
    'business-layer': 'business-layer（C端后端）',
    'backend': 'management-layer（B端后端）',
    'management-layer': 'management-layer（B端后端）'
  };

  labels.forEach(label => {
    const lowerLabel = label.toLowerCase();
    for (const [key, value] of Object.entries(labelMap)) {
      if (lowerLabel.includes(key)) {
        if (!projects.includes(value)) {
          projects.push(value);
        }
      }
    }
  });

  return projects;
}

// 智能判断涉及的项目（基于标题、描述和工作量）
function inferProjectsFromStory(issue) {
  const projects = new Set();
  const summary = issue.fields.summary || '';
  const description = extractTextFromDescription(issue.fields.description);
  const labels = issue.fields.labels || [];
  
  // 首先尝试从标签获取
  const projectsFromLabels = mapLabelsToProjects(labels);
  projectsFromLabels.forEach(p => projects.add(p));
  
  // 从标题和描述中提取文本
  const text = `${summary} ${description}`.toLowerCase();
  
  // 规则1: OMA 表示小程序
  const hasOMA = text.includes('oma') || text.includes('[oma]') || summary.toLowerCase().includes('[oma]');
  
  // 规则2: MPA 或 APP 表示 H5（忽略原生 APP）
  const hasMPA = text.includes('mpa') || text.includes('[mpa]') || summary.toLowerCase().includes('[mpa]');
  const hasAPP = text.includes('[app]') || summary.toLowerCase().includes('[app]');
  
  // 规则3: 从工作量标识判断（FE/BE/QA）
  const feMatch = summary.match(/FE(\d+)/i);
  const beMatch = summary.match(/BE(\d+)/i);
  const qaMatch = summary.match(/QA(\d+)/i);
  
  // 如果有 FE 工作量，说明需要前端开发
  if (feMatch) {
    // 根据 OMA/MPA/APP 判断具体前端项目
    if (hasOMA) {
      projects.add('miniprogram（小程序）');
    } else if (hasMPA || hasAPP) {
      // 排除明确提到原生的情况
      if (!text.includes('native') && !text.includes('原生') && 
          !text.includes('ios') && !text.includes('android')) {
        projects.add('h5-web（H5）');
      }
    } else {
      // 如果没有明确标识，根据内容关键词判断
      if (text.includes('小程序') || text.includes('miniprogram') || text.includes('wechat')) {
        projects.add('miniprogram（小程序）');
      } else if (text.includes('管理端') || text.includes('management') || text.includes('后台')) {
        projects.add('finder-management（管理端）');
      } else {
        // 默认为 H5
        projects.add('h5-web（H5）');
      }
    }
  }
  
  // 如果有 BE 工作量，说明需要后端开发
  if (beMatch) {
    // 根据业务上下文判断是 C 端还是 B 端
    if (text.includes('管理端') || text.includes('management') || 
        text.includes('后台') || text.includes('admin') || text.includes('b端')) {
      projects.add('management-layer（B端后端）');
    } else {
      // 默认是 C 端后端
      projects.add('business-layer（C端后端）');
    }
  }
  
  // 如果没有 FE/BE 标识，但有明确的 OMA/MPA 标识，也要添加对应项目
  if (!feMatch && !beMatch) {
    if (hasOMA) {
      projects.add('miniprogram（小程序）');
    }
    if (hasMPA || hasAPP) {
      if (!text.includes('native') && !text.includes('原生') && 
          !text.includes('ios') && !text.includes('android')) {
        projects.add('h5-web（H5）');
      }
    }
  }
  
  // 规则4: 管理端相关
  if (text.includes('管理端') || text.includes('management') || 
      text.includes('后台') || text.includes('admin')) {
    projects.add('finder-management（管理端）');
  }
  
  // 规则5: 关键词匹配（作为补充）
  const keywords = {
    'miniprogram（小程序）': ['小程序', 'miniprogram', 'wechat', '微信'],
    'h5-web（H5）': ['h5', 'web', '网页', '浏览器'],
    'finder-management（管理端）': ['管理端', 'management', '后台', 'admin', 'cms'],
    'business-layer（C端后端）': ['api', '接口', 'service', '服务', 'job', '定时任务'],
    'management-layer（B端后端）': ['b端', 'b-side', '管理接口']
  };
  
  for (const [project, words] of Object.entries(keywords)) {
    if (words.some(word => text.includes(word))) {
      // 只有在没有明确的 FE/BE 标识时才通过关键词添加
      if (!feMatch && !beMatch) {
        projects.add(project);
      }
    }
  }
  
  return Array.from(projects);
}

// 从 JIRA 描述对象中提取纯文本
function extractTextFromDescription(description) {
  if (!description) return '';
  if (typeof description === 'string') return description;
  
  // JIRA 的描述是 Atlassian Document Format (ADF)
  let text = '';
  
  function traverse(node) {
    if (!node) return;
    
    if (node.type === 'text' && node.text) {
      text += node.text + ' ';
    }
    
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach(traverse);
    }
  }
  
  traverse(description);
  return text;
}

// 映射 Sprint 状态
function mapSprintState(state) {
  const stateMap = {
    'future': '规划中',
    'active': '进行中',
    'closed': '已完成'
  };
  return stateMap[state.toLowerCase()] || state;
}

// ===== Figma 相关函数 =====

// 从 ADF 描述文本中提取所有 Figma 链接
// 从 ADF 描述中提取所有 Figma 链接，返回 { url, fileKey, nodeId }
function extractFigmaLinks(description) {
  const text = extractTextFromDescription(description);
  const regex = /https:\/\/www\.figma\.com\/(file|design|proto)\/([a-zA-Z0-9]+)([^\s"')]*)/g;
  const links = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const fullUrl = match[0];
    const fileKey = match[2];
    const rest = match[3] || '';
    const nodeIdMatch = rest.match(/[?&]node-id=([^&\s]+)/);
    const nodeId = nodeIdMatch ? decodeURIComponent(nodeIdMatch[1]) : null;
    links.push({ url: fullUrl, fileKey, nodeId });
  }
  // 按 fileKey 去重
  const seen = new Map();
  for (const link of links) {
    if (!seen.has(link.fileKey)) seen.set(link.fileKey, link);
  }
  return Array.from(seen.values());
}






// 同步 Sprint 所有 Story 的 Figma 设计稿
// 扫描 Sprint 所有 Story 的 Figma 链接，输出报告
// 有 node-id 的链接可交给 figma-server 导出；无 node-id 的只给链接
async function syncSprintFigmaDesigns(pi, sprint, sprintName) {
  const jql = `sprint = "${sprintName}" AND type = Story ORDER BY priority DESC`;
  const issues = await jiraRequest(
    `/search/jql?jql=${encodeURIComponent(jql)}&maxResults=100&fields=summary,description`
  );

  const withNodeId = [];    // 有 node-id，可以直接导出
  const withoutNodeId = []; // 无 node-id，只给链接
  const noFigma = [];       // 没有 Figma 链接

  for (const issue of issues.issues) {
    const links = extractFigmaLinks(issue.fields.description);
    if (links.length === 0) {
      noFigma.push(issue.key);
      continue;
    }
    for (const link of links) {
      const entry = { storyKey: issue.key, summary: issue.fields.summary, ...link };
      if (link.nodeId) {
        withNodeId.push(entry);
      } else {
        withoutNodeId.push(entry);
      }
    }
  }

  const sprintDir = `docs/iterations/sprint-${pi}.${sprint}`;

  let report = `## Sprint ${pi}.${sprint} Figma 设计稿扫描结果\n\n`;
  report += `📊 统计: ${withNodeId.length} 个链接含 node-id（可导出），`;
  report += `${withoutNodeId.length} 个链接无 node-id，${noFigma.length} 个 Story 无 Figma 链接\n\n`;

  if (withNodeId.length > 0) {
    report += `### ✅ 含 node-id（可用 figma-server 导出到 ${sprintDir}/assets/）\n\n`;
    for (const item of withNodeId) {
      report += `- **${item.storyKey}** ${item.summary}\n`;
      report += `  - URL: ${item.url}\n`;
      report += `  - fileKey: \`${item.fileKey}\`, nodeId: \`${item.nodeId}\`\n`;
    }
    report += '\n';
  }

  if (withoutNodeId.length > 0) {
    report += `### ⚠️ 无 node-id（请在 Figma 中 focus 到具体 page 后重新复制链接）\n\n`;
    for (const item of withoutNodeId) {
      report += `- **${item.storyKey}** ${item.summary}\n`;
      report += `  - URL: ${item.url}\n`;
    }
    report += '\n';
  }

  if (noFigma.length > 0) {
    report += `### — 无 Figma 链接\n\n`;
    report += noFigma.map(k => `- ${k}`).join('\n') + '\n';
  }

  return { content: [{ type: 'text', text: report }] };
}

// 启动服务器
// ==================== Confluence 功能 ====================

async function confluenceRequest(endpoint, options = {}) {
  const url = `https://${ATLASSIAN_HOST}/wiki/rest/api${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Confluence API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

// 将简单 Markdown 转换为 Confluence storage format (XHTML)
function markdownToConfluenceStorage(markdown) {
  let html = markdown
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul])(.+)$/gm, '<p>$1</p>');
  return `<p>${html}</p>`;
}

async function confluenceSearch(query, spaceKey, limit = 10) {
  // 构建 CQL 查询
  let cql = query.includes('=') || query.includes('~')
    ? query  // 已经是 CQL 语法
    : `text ~ "${query}" AND type = page`;
  
  if (spaceKey) {
    cql += ` AND space = "${spaceKey}"`;
  }

  const params = new URLSearchParams({
    cql,
    limit: String(limit),
    expand: 'space,version'
  });

  const data = await confluenceRequest(`/content/search?${params}`);
  
  const results = (data.results || []).map(page => ({
    id: page.id,
    title: page.title,
    space: page.space?.key,
    url: `https://${ATLASSIAN_HOST}/wiki${page._links?.webui || ''}`,
    lastModified: page.version?.when
  }));

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ total: data.totalSize, results }, null, 2)
    }]
  };
}

async function confluenceGetPage(pageId) {
  const data = await confluenceRequest(
    `/content/${pageId}?expand=body.storage,version,space,ancestors`
  );

  // 将 storage format 转为可读文本（简单处理）
  const bodyText = (data.body?.storage?.value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        id: data.id,
        title: data.title,
        space: data.space?.key,
        version: data.version?.number,
        url: `https://${ATLASSIAN_HOST}/wiki${data._links?.webui || ''}`,
        ancestors: (data.ancestors || []).map(a => ({ id: a.id, title: a.title })),
        content: bodyText
      }, null, 2)
    }]
  };
}

async function confluenceGetSpacePages(spaceKey, limit = 20) {
  const params = new URLSearchParams({
    spaceKey,
    limit: String(limit),
    expand: 'version',
    type: 'page'
  });

  const data = await confluenceRequest(`/content?${params}`);

  const pages = (data.results || []).map(page => ({
    id: page.id,
    title: page.title,
    version: page.version?.number,
    url: `https://${ATLASSIAN_HOST}/wiki${page._links?.webui || ''}`
  }));

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ total: data.size, pages }, null, 2)
    }]
  };
}

async function confluenceCreatePage(spaceKey, title, content, parentId) {
  const body = {
    type: 'page',
    title,
    space: { key: spaceKey },
    body: {
      storage: {
        value: markdownToConfluenceStorage(content),
        representation: 'storage'
      }
    }
  };

  if (parentId) {
    body.ancestors = [{ id: parentId }];
  }

  const data = await confluenceRequest('/content', {
    method: 'POST',
    body: JSON.stringify(body)
  });

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        id: data.id,
        title: data.title,
        url: `https://${ATLASSIAN_HOST}/wiki${data._links?.webui || ''}`,
        message: '页面创建成功'
      }, null, 2)
    }]
  };
}

// 下载 JIRA 附件
async function downloadAttachment(storyKey, saveDir, attachmentIndex = 0) {
  // 获取 Issue 的附件信息
  const issue = await jiraRequest(`/issue/${storyKey}?fields=attachment`);

  const attachments = issue.fields.attachment || [];
  if (attachments.length === 0) {
    throw new Error(`Story ${storyKey} 没有附件`);
  }

  if (attachmentIndex >= attachments.length) {
    throw new Error(`附件索引 ${attachmentIndex} 超出范围，共有 ${attachments.length} 个附件`);
  }

  const attachment = attachments[attachmentIndex];
  const downloadUrl = attachment.content;
  const filename = attachment.filename;

  // 确保保存目录存在
  await fs.mkdir(saveDir, { recursive: true });

  // 下载附件
  const response = await fetch(downloadUrl, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': '*/*'
    }
  });

  if (!response.ok) {
    throw new Error(`下载附件失败: ${response.status} ${response.statusText}`);
  }

  // 保存文件
  const filePath = path.join(saveDir, `${storyKey}-${filename}`);
  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        success: true,
        story_key: storyKey,
        filename: filename,
        saved_to: filePath,
        size: attachment.size,
        mime_type: attachment.mimeType
      }, null, 2)
    }]
  };
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Atlassian MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
