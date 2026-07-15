# CARTS-4572 设计过程简报

## 来源状态
- 模式：Mock validation
- Jira：mock/mock-jira-issue.md
- Figma：mock/mock-figma-content.md
- 用途：用于验证需求提取、用户流程和设计起稿结构。

## 需求提取

### 背景
用户需要在购物车中直接调整商品数量，避免离开购物车重新添加商品。

### UX 目标
- 让用户可以直接增加或减少商品数量。
- 更新过程中提供清晰反馈。
- 覆盖错误、空态、撤销和禁用状态。

## 功能需求拆解

| ID | 需求 | 来源 | 优先级 |
|---|---|---|---|
| FR1 | 用户可以增加购物车商品数量 | Jira AC1 | Must |
| FR2 | 用户可以减少购物车商品数量 | Jira AC1 | Must |
| FR3 | 数量更新成功后总价更新 | Jira AC2 | Must |
| FR4 | 更新中展示 loading 状态 | Jira AC3 | Must |
| FR5 | 更新失败展示错误提示并允许重试 | Jira AC4 | Must |
| FR6 | 购物车为空时禁用 checkout | Jira AC8 | Must |

## 用户流程 / 配置流程

### 主流程

| Step | 角色 | 操作 | 系统反馈 | 关联需求 |
|---|---|---|---|---|
| 1 | 用户 | 打开购物车 | 展示商品和数量 stepper | FR1 |
| 2 | 用户 | 点击加号或减号 | stepper 进入更新中状态 | FR4 |
| 3 | 系统 | 更新成功 | 数量和总价刷新 | FR3 |
| 4 | 用户 | 继续结算 | 有商品时进入 checkout | FR6 |

### 异常流程

| 场景 | 触发条件 | 系统反馈 | 设计状态 |
|---|---|---|---|
| 更新失败 | API 返回失败 | 恢复旧数量，展示错误和重试入口 | Error + Retry |
| 删除商品 | 数量降为 0 | 商品移除，展示 Undo | Removed + Undo |
| 空购物车 | 无商品 | 展示空态，禁用 checkout | Empty + Disabled |

## Figma 起稿 / 补稿提示

- Cart - Default
- Cart - Updating Quantity
- Cart - Error
- Cart - Item Removed
- Cart - Empty

## 待确认问题

- Undo 时长是否固定为 5 秒？
- 错误提示文案是否已有全局规范？
