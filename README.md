# dsh-failure-delta

面向 DeepSeek Harness（DSH）的**错误变化看板**。计划自动观察受支持的测试、类型检查和构建工具结果，把相邻可比较运行中的错误变化显示为时间线，帮助用户判断修复是否取得进展，而不必反复翻阅长日志。

**当前状态：CORE_TESTED；Host/Web/fresh-profile 尚未授予。** 已有纯 TypeScript 核心、宿主无关的 canonical observer adapter、10 个高价值测试、类型检查和构建产物检查；真实 DSH composition、Remote codec、Client bundle、fresh profile 和 GitHub 发布仍未执行。

## 预期效果

```text
测试运行 R7 → R8：完整可比
失败 12 → 3（示例数据）
本次明确通过 10 · 新增失败 1 · 持续失败 2
未执行/跳过/身份不明的项目单列，不计为已解决
```

默认自动观察，但不自动执行命令、不改工具结果、不阻断 Agent 完成、不向模型追加提醒。Web 看板和按需查询工具是计划中的主要入口。

## 核心边界

- 区分“完整可比”“有限观察”“不可比较”。
- 日志截断、取消、超时、范围缩小、跳过测试都不能推导修复成功。
- 测试失败→本次通过必须有同一测试的明确 passed 记录。
- 编译诊断消失只表示本次检查不再出现，不证明修改因果关系或项目整体可用。
- v1 只自动接入 DSH 原生 bash/pwsh 的前台规范结果；PTC 内部调用需单独验证。背景任务、MCP、自定义 shell、手动终端不承诺覆盖。
- v1 内存保存派生历史；Host 重启后清空，不改写 DSH 会话。
- 原始日志由 DSH 保管；插件不建立第二份日志仓库、不自动读 spillPath、不上传数据。

## 文档入口

- [项目章程](docs/PROJECT.md)
- [架构设计](docs/ARCHITECTURE.md)
- [技术规范](docs/TECHNICAL-SPEC.md)
- [解析器规范](docs/PARSER-SPEC.md)
- [数据模型与对比算法](docs/DATA-MODEL.md)
- [界面与交互](docs/UI-UX.md)
- [威胁模型](docs/THREAT-MODEL.md)
- [设计决策](docs/DECISIONS.md)
- [测试计划](docs/TEST-PLAN.md)
- [需求追踪矩阵](docs/TRACEABILITY.md)
- [创新性与相邻项目](docs/NOVELTY.md)
- [官方上游基线](docs/UPSTREAM-BASELINE.md)
- [实现交接书及新对话提示词](docs/IMPLEMENTATION-HANDOFF.md)
- [验收标准](docs/ACCEPTANCE-CRITERIA.md)
- [协作书](docs/COLLABORATION-LOG.md)

## 本地开发

```text
pnpm install --ignore-scripts
pnpm typecheck
pnpm test
pnpm build
```

公开导出暂时分为 `dsh-failure-delta/core` 与 `dsh-failure-delta/host`。`core` 只做确定性的命令识别、受限 runner 解析、脱敏/指纹、三档可比性、差分和有界内存存储；`host` 只接受结构化的 start/result 适配输入，不执行 shell、不读 `spillPath`、不改变原工具结果，也不声称已完成 DSH 官方插件注册。接入 DSH 时必须把 `exec.agent.session` 作为 opaque Session 归属，并以官方 `tools/execute`/`tools/result` seam 连接；不能按字符串猜 session 或 PTC 父子关系。

## 状态与基线

| 项目 | 状态 |
| --- | --- |
| 设计基线 | v0.1 / DESIGN |
| 官方源码锚点 | `ddefc45fbc7f8e46dd73185e68295696d1297887` |
| 官方根版本 | `0.1.6-alpha.2`（非插件兼容性证明） |
| 解析器、核心、Host-neutral adapter | 已实现；仅核心测试 |
| DSH Host/PTC、Client/Remote、fresh profile | 未执行；未授予 HOST_TESTED/Web |
| 单元/确定性 fixture | 10 tests passed（2026-09-19） |
| Git/npm/GitHub 发布 | 未执行、未授权 |

已有测试报告、失败重跑、验证门禁等相邻工具；本项目差异是 DSH 内的跨运行差分展示与严格证据降级，不声称绝对首创或全球唯一。
