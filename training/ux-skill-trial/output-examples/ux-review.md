# CARTS-4572 UX 评审报告

## 来源状态
- 模式：Mock validation
- Jira：mock/mock-jira-issue.md
- Figma：mock/mock-figma-content.md
- 有效性：仅用于验证 skill 输出结构，不代表真实 Jira/Figma API 验证。

## 整体状态
需要修改

## 执行摘要

Mock Figma 覆盖了购物车数量调整的主流程和 loading 状态，但缺少 API 错误状态，并且空购物车状态与 Jira AC 冲突：空购物车时 checkout 应禁用，但设计中仍显示可继续结算。

## Jira-Figma 差异分析

| 需求 | Jira 来源 | Figma 证据 | 状态 | 严重程度 | 建议动作 |
|---|---|---|---|---|---|
| 数量 stepper 可用 | AC1 | Cart - Default | 已覆盖 | 低 | 无需调整 |
| 总价更新 | AC2 | 仅展示 subtotal，未说明更新行为 | 部分覆盖 | 中 | 增加总价刷新说明 |
| Loading 状态 | AC3 | Cart - Updating Quantity | 已覆盖 | 低 | 无需调整 |
| 错误状态 | AC4 | 未看到 | 缺失 | 高 | 增加 Cart - Error |
| 空购物车禁用 checkout | AC8 | Empty frame 中 checkout 仍可用 | 冲突 | 高 | 禁用 checkout 按钮 |

## PM / PO 需要补充或确认的内容

| 缺失 / 模糊项 | 为什么重要 | 建议补充到 PRD / Jira 的内容 | Owner |
|---|---|---|---|
| Undo 持续时间 | 影响交互和 QA 验收 | 明确使用 5 秒还是全局 toast 时长 | PM/PO |
| 错误文案 | 影响设计和开发实现 | 提供更新失败文案和 retry 行为 | PM/PO |

## FE / BE 实现注意事项

| 模块 | 注意事项 | 来源 / 证据 | 建议处理 |
|---|---|---|---|
| 数量更新 API | 更新可能失败或延迟 | Jira engineering comment | 需要返回可映射到 UI 的错误信息 |
| 乐观更新 | 若先更新 UI 再回滚，需要清楚策略 | AC2 / AC4 | 明确成功后更新还是 optimistic update |

## QA / 测试注意事项

| 测试场景 | 预期结果 | 优先级 | 来源 |
|---|---|---|---|
| 数量增加成功 | 数量和总价更新 | 高 | AC1 / AC2 |
| 更新失败 | 恢复旧数量并展示错误 | 高 | AC4 |
| 商品移除 | 展示 Undo | 中 | AC6 / AC7 |
| 空购物车 | checkout 禁用 | 高 | AC8 |

## 建议贴回 Jira 的评论

```md
UX review mock result:

The current design covers the cart quantity happy path and loading state, but still needs:
1. API error state and retry behavior.
2. Disabled checkout in empty cart state.
3. Clear undo duration.
4. Subtotal update behavior annotation.
```
