# 验收标准与证据状态

当前：D1 SOURCE + D2 CORE_TESTED（局部核心）。下面的预设门槛必须逐项附证据，不能以文档、mock 或局部核心测试冒充真实宿主/Web 能力。

## AC-001：D0 文档可交接

18 个 Markdown 文件齐全；本地链接存在、围栏配对；32 FR + 10 NFR 在追踪矩阵各有唯一行；72 TP 与引用一致；协作书 STARTED/终态可关联。需真实文件校验记录。该 PASS 仅代表文档结构一致，不证明设计无缺陷或实现可用。

## AC-002：D1 公共接口与版本基线

官方 pinned SHA、实际依赖/runner/schema、cwd 与 Session/PTC、文件提供者、外部 Client/Remote 构建均有 probe 证据。不能解决的 seam 记 BLOCKED/降级；通过源码阅读不能授予运行兼容声明。

## AC-003：采集不改变原工具

真实 bash/pwsh、工具错误/取消、嵌套 PTC 与 collector 开关 A/B：next 一次、value/content/异常/signal/退出结果不变；无 Agent 不越权。记录器故障不能改变业务工具。

## AC-004：限定解析器可靠

命令识别保守，支持版本/格式有真实输出和合成边界 fixture；纯核心确定性、property/fuzz 无分类错误。未知格式/复合命令/增量/坏 XML/JSON 有明确降级，不能零匹配绿色成功。

## AC-005：差异不超出证据

三档门槛、时间顺序、手选基线、重复诊断、参数化测试和歧义全部按 oracle。skip/pending/缺失/范围改变/截断从不误称通过；完整可比的 passed-now 与 not-reproduced 文案准确，不称永久修复/根因/因果。

有限观察下可以展示当前显式 passed 的单次事实，但不能借此给整组比较授予完整可比或修复率。不可比较只并排事实。

## AC-006：安全与隐私

默认无额外文件/网络/LLM 行为；显式报告读取限制路径、新鲜度、预算和 XML 安全；跨会话 RPC 与猜 runId 拒绝；文本注入不执行。Remote、console、pack 与 fixture 不泄漏原日志/命令/秘密。脱敏残余风险必须公开，不能写完备秘密过滤保证。

## AC-007：有界资源和恢复

队列、Pending、run/session/store、测试/诊断/字节上限实测；丢失/淘汰可见；重启 epoch 清空且刷新正确。性能目标按 TECHNICAL-SPEC 在注明机器和样本上验证；默认提醒 token 为零，查询成本独立记录。

## AC-008：实际可见且可用

真实 DSH Web 中两轮支持检查后可见分类、证据与原因，失败/过期状态不显示绿空表。按需工具 headless 可用，原调用入口走官方 API 或明确禁用；键盘与窄屏通过。仅 query 或截图 mock 不算 Web 验收。

## AC-009：真实组合与打包

单独授权的全新隔离 profile 真实加载/停用/卸载新唯一行；packed client/remote 与 Host 可用；Windows+pwsh+Web、Linux+bash+headless、支持 runner 报告分别测试。缺平台只能发布明确 partial/限定支持声明。没有用户发布授权不上传。

## AC-010：交付与协作完整

每次实质工作有开始与终态时间/执行者/动作/问题/证据。交付支持矩阵、验收结果、未执行、剩余风险和下一步；更新文档而不抹掉历史。不把设计、构建或局部测试称全场景可用。

## 当前验收账本

| 项目 | 本次状态 | 证据 |
|---|---|---|
| AC-001 | PASS（仅 D0 文档结构校验） | 18 文件、42 需求/追踪行、72 用例，断链/围栏/未定义引用为 0；协作书 COL-20260919-002 |
| AC-002 | SOURCE；HOST_TESTED NOT RUN | `UPSTREAM-BASELINE.md` 的 D1-20260919-004 固定 SHA probe；真实 composition/runner 仍未执行 |
| AC-003 | NOT RUN；adapter 局部通过 | 无真实 DSH execute/result A/B；host-neutral canonical adapter 仅验证不读 spillPath、错误/后台不升级 |
| AC-004 | CORE_TESTED（局部） | tsc/Vitest/pytest 合成边界、直接命令和 XML entity 拒绝已通过；真实 runner/版本窗口未授予 |
| AC-005 | CORE_TESTED（局部） | compareRuns/store 测试覆盖显式 passed、缺失 unconfirmed、observational/incomparable 和 startSeq 基线 |
| AC-006 | CORE_TESTED（局部） | 脱敏摘录、HMAC 身份、XML entity 拒绝和 opaque spillPath fixture 已通过；真实 RPC/provider/日志审计未执行 |
| AC-007 | CORE_TESTED（局部） | store 淘汰、bounded parser fixture 和 background/tool failure tombstone 状态已通过；性能 p95/完整预算未实测 |
| AC-008 | NOT RUN | 无 Web/headless 产物 |
| AC-009 | NOT RUN | 未安装/打包/发布 |
| AC-010 | 进行中；本轮实现证据已记录 | COL-20260919-004；仍需 Host/Web/pack/push 前清单与终态记录 |

## 发布声明等级

DESIGN → CORE_TESTED → HOST_TESTED → LOCALLY_TESTED（注明精确组合）→ 发布就绪（另授权）。这些是项目自定义证据等级，不能用高一级词替代缺失的真实 Web/fresh-profile/其他 OS/provider 证据。
