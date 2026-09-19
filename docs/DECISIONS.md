# 设计决策记录

状态说明：Accepted 为冻结设计要求；Pending 为实现前必须验证的候选接口。变更需追加新 ADR、说明替代关系、更新追踪矩阵并记录协作书，不直接抹掉历史。

## ADR-001：旁路看板而非完成门禁 — Accepted

用户需要高频且可见的收益。只汇总失败变化，不阻塞 done，不改 shell，不重复 verification receipt 产品定位。

## ADR-002：先支持原生 foreground — Accepted

使用最终规范值；后台句柄不是结束结果。MCP/IDE/外部 CI 任意日志接入不在 v1。

## ADR-003：三档证据，未知不等于匹配 — Accepted

完整可比要求所有必要条件已知且一致。有限观察仍有价值，但缺失只称未再观察到。

## ADR-004：默认不额外读取 — Accepted

不自动读取 spillPath、报告、配置或运行版本。明确 profile 后有限报告/元数据读取，声明本身不能认证环境。

## ADR-005：唯一新报告而非 mtime 判新 — Accepted

已有报告无法可靠证明本轮产物；不自动删除、重命名或改用户命令。缺开始证据即降级。

## ADR-006：显式通过与诊断消失分开 — Accepted

测试 passed-now 与编译诊断 not-reproduced 不混合计数；任何一种都不是永久修复证明。

## ADR-007：纯核心、宿主、Web 分层 — Accepted

解析和差异可确定性单测；真实事件、权限、client/remote、打包必须单独实测。

## ADR-008：HMAC 语义身份与多重集合 — Accepted

行号移动不制造新诊断；消息数字和参数名保留；脱敏不参与身份生成，避免 [REDACTED] 合并。

## ADR-009：按开始序号选基线 — Accepted

选本次开始前已完成的最近同系列运行；重叠只作观察，不称修复因果。

## ADR-010：v1 内存历史 — Accepted

降低泄密和迁移复杂度。重启清空是公开限制，不能冒充可恢复的日志产品。

## ADR-011：有界资源和可见缺失 — Accepted

淘汰、丢失与超限不能显示为零错误；保留预算内 tombstone 与健康聚合。

## ADR-012：只读授权 Remote — Accepted

每次绑定 Session，再校验运行所属；客户端不决定授权。无未经验证的私有 HTTP/DOM 绕路。

## ADR-013：Web 扩展及生成链路 — Pending

官方 sidebar/client/Remote 为候选；D1 证明精确 API、codec 生成及外部包构建。不能仅由源码推断插件可装。

## ADR-014：runner 版本限定 — Accepted

官方 reporter 文档不等于旧版 schema 通用。D1 固化各支持窗口、fixture 与真实输出；未知版本降级。

## ADR-015：独立 Loader 行与权限边界 — Accepted

不替换官方同 ID 模块，不更改公共 profile，不发布。全新隔离 profile 验证需明确授权。

## ADR-016：创新是组合定位，不宣称全球首创 — Accepted

相邻测试报告/verification/回归工具已存在。差异点是 DSH 会话内被动比较、证据降级、显式未确认和原调用定位；不能保证 GitHub 或市场无相似。
