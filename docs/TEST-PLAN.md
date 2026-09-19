# 测试计划

除下方“本轮核心证据”明确列出的局部核心场景外，其余用例均为 NOT RUN。本文是预先规定的测试，不是已经通过的证明。mock、fixture、源码检查、真实 Host、fresh profile、Web/headless、远程提供者与 packed artifact 证据分别记录。

## 本轮核心证据（2026-09-19）

以下是局部实现证据，不改写尚未执行的真实宿主/平台用例：

- 命令与 parser：直接 tsc/ Vitest/ pytest 识别、shell 复合命令拒绝、tsc 重复诊断/续行/截断、Vitest 混杂 stdout 拒绝、pytest JUnit/文本降级。
- 安全与边界：JUnit DTD/ENTITY 拒绝；摘要脱敏；HMAC 语义身份与显示摘录分离；foreground adapter 只复制有界 stdout/stderr，不读取 spillPath；background/tool failure 进入 unsupported/error，而不是成功运行。
- 差分与资源：显式 failed→passed 才计 `passedNow`；缺失用例计 `unconfirmed`；unknown evidence 降为 observational；series 变化为 incomparable；store 按 startSeq 选基线并暴露淘汰健康计数。
- 命令：`pnpm typecheck`、`pnpm test`、`pnpm build` 均退出码 0；测试共 2 files / 10 tests passed。未执行 `pnpm verify` 以避免重复运行同一 typecheck/test/build 集合。

本节不能替代 TP-001–TP-072 中的真实 bash/pwsh、PTC/session、Remote/Client、Web/headless、fresh profile、跨平台、provider 和 packed artifact 证据。

## 公共测试方法

- 纯核心用独立 oracle 验证分类，加入 property-based 与有界 fuzz；fixture 只用人工合成且无真实凭据。
- collector A/B：相同调用开启/关闭插件，比较规范值/content/异常/调用次数/signal；保留实际 runner、DSH SHA、OS 与命令证据。
- runner probes 先在授权测试目录产生真实输出，再审阅并脱敏作为 fixture；不得悄悄在用户项目运行测试。
- 每条报告包含命令、环境、实际结果、断言、证据路径、时间、执行者与失败原因。无能力/未授权记 BLOCKED 或 NOT RUN，不填 PASS。

## 用例目录

| ID | 验证 | 必须断言 |
|---|---|---|
| TP-001 | bash foreground 正常/非零 | 记录正确，原 DTO 不变 |
| TP-002 | pwsh foreground Windows | 与真实 DTO 对齐，非 Unix 误解析 |
| TP-003 | execute next 与原异常 | next 恰好一次，原异常透传 |
| TP-004 | 最终 value 与渲染 content 不同 | 只按最终规范值解析，不猜渲染文本 |
| TP-005 | 嵌套 PTC | 官方父 token/session 归属，独立记录 |
| TP-006 | 重复 result/opaque callId | 去重一次，不靠 ID 字符串推断 |
| TP-007 | 无 Agent/Session 调用 | 不进入其他会话，状态可解释 |
| TP-008 | background/未知 DTO/tool failure | unsupported/error，不假称完成通过 |
| TP-009 | 简单直接命令与固定包装 | 支持矩阵内识别，语义标志保留 |
| TP-010 | 管道/复合/替换/未知 script | 不升级已知 runner，不执行命令 |
| TP-011 | Windows 引号/盘符/Unicode | shell 方言明确，路径不串组 |
| TP-012 | 实际 cwd 与 session cwd 不同 | 使用可信执行坐标，未知降级 |
| TP-013 | watch/changed/lf/shard/bail | 范围变化被检测，不能显示修复率 |
| TP-014 | runner/schema 未支持版本 | parser-unsupported 可见 |
| TP-015 | tsc -b/增量输出为空 | 不据空输出认定全量完成 |
| TP-016 | Vitest JSON stdout 混杂 | 不接受拼接/夹杂 JSON 为完整报告 |
| TP-017 | pytest JUnit 缺范围/清单 | 降级，缺失 case 未确认 |
| TP-018 | 泛构建/未知 runner | opaque 退出事实，0 匹配不成功 |
| TP-019 | tsc 文件/全局/续行 | 诊断和次数与 oracle 一致 |
| TP-020 | tsc 括号路径/冒号/CRLF/ANSI | 正文不误切，控制符不显示 |
| TP-021 | 诊断行列移动 | 身份相同、位置更新 |
| TP-022 | 消息数字/变量类型差异 | 不任意规范化为同一错误 |
| TP-023 | 重复同诊断 3→1 | 持续 1、缺失 2，多重集合 |
| TP-024 | Vitest 所有状态及 totals | 清单自洽；未知字段状态降级 |
| TP-025 | Vitest 同名/参数化/多项目 | 保留身份边界，冲突 ambiguous |
| TP-026 | JUnit failure/error/skipped/空 case | 支持 schema 下正确状态，不补造 inventory |
| TP-027 | pytest 参数化/deselect/collection error | 范围和未确认正确 |
| TP-028 | XML DTD/XXE/膨胀/深层节点 | 无网络/外部读取，预算内拒绝 |
| TP-029 | 深层 JSON/超大数组/格式坏 | 有界失败，不阻塞/耗尽 |
| TP-030 | property/fuzz 与纯核心重放 | 确定性、计数守恒、无宿主依赖 |
| TP-031 | 完整可比基准 | 必要证据已知一致才升级 |
| TP-032 | runtime/env/配置未知 | 不以默认/用户声明补成 known |
| TP-033 | 命令/cwd/范围/runner/schema 改变 | incomparable 或无基线，列原因 |
| TP-034 | 源码变化但配置不变 | 仅注释，不能声称因果 |
| TP-035 | 完成乱序 | 按开始前完成的基线，不按 finish |
| TP-036 | 并发重叠 | 降级并显示，禁止因果/认证改善 |
| TP-037 | 手选基线/跨系列基线 | 同门槛，不可强制升级 |
| TP-038 | 首轮/淘汰基线 | baseline-missing/expired，不造 0→N |
| TP-039 | failed→显式 passed | 完整可比显示本次通过，不称永久修复 |
| TP-040 | failed→skip/pending/todo/absent | unconfirmed，不计已通过 |
| TP-041 | 新增/持续/缺失混合 | 分类单位分离、计数与 oracle 一致 |
| TP-042 | 完整与有限诊断缺失 | not-reproduced 与 not-observed 文案不同 |
| TP-043 | 退出 0 但未完整/退出 1 但部分改善 | 进程事实与差异独立 |
| TP-044 | 根因/首错误/百分比文案 | 不生成因果或永久修复断言 |
| TP-045 | stdout/stderr/解析超限 | completeness 降级，保留丢弃数 |
| TP-046 | 队列满/字节预算/多会话压力 | 不阻塞工具，丢失状态可见 |
| TP-047 | run/session/store 淘汰 | 全局边界守住，健康计数正确 |
| TP-048 | 取消/超时/销毁/Pending 超限与 TTL | 原 signal 不变，缺开始证据不认证 |
| TP-049 | 密钥/URL/外部路径/控制符 fixture | 远端、摘录、日志均无原秘密 |
| TP-050 | 不同秘密脱敏成同文本 | 指纹不同，不错误合并 |
| TP-051 | 报告旧文件/同长度同 tick | 不靠 mtime 新鲜，不接受为本次报告 |
| TP-052 | 报告越界/链接/执行世界不同 | 提供者约束失败即拒绝/降级 |
| TP-053 | 唯一新报告/读期间替换/共享路径 | 仅稳定独占新报告合格，其余降级 |
| TP-054 | 默认观察与 opt-in 元数据 | 默认零额外读写；允许读取不执行配置 |
| TP-055 | record/parser/RPC 自身异常 | recorderErrors 可见，原工具不变 |
| TP-056 | 预算性能与长期压力 | 指定机器 p95/字节/峰值实测，未测不 PASS |
| TP-057 | Session RPC 与猜 runId | 重复授权，跨会话不泄露存在性 |
| TP-058 | epoch/revision/游标/重连 | 旧快照过期，全量刷新，不拼历史 |
| TP-059 | Web 各等级/错误/空/partial | 非绿假成功，事实与单位清晰 |
| TP-060 | 原工具调用入口 | 使用实际官方导航；无接口则禁用 |
| TP-061 | 按需查询工具 | 只读有界，不自动注入 token/执行 shell |
| TP-062 | 看板刷新/关闭/轮询退避 | 刷新不重跑，面板关闭停止请求 |
| TP-063 | HTML/OSC/提示注入/长名称 | 纯文本，不能执行/导航恶意内容 |
| TP-064 | 键盘/窄屏/色觉/焦点 | 不靠颜色，刷新不抢焦点 |
| TP-065 | 干净 profile 唯一 Loader 行 | 可加载、停用、卸载；未替换官方模块 |
| TP-066 | 外部 Client/Remote 生成与 packed 安装 | 实际产物可用，不以配置 dump 代替 |
| TP-067 | 真实 Windows + pwsh + Web 两轮 | 用户实际看到三类变化与未确认 |
| TP-068 | 真实 Linux + bash + headless 两轮 | 查询可用，无浏览器依赖，结果不变 |
| TP-069 | 真实 PTC/无 PTC 宿主 | 分别证明或明确支持限制 |
| TP-070 | 真实 opt-in runner 报告/profile | 每个支持版本有真实样本，不只 fixture |
| TP-071 | 网络/写入/LLM/token 副作用审计 | 默认无额外行为；按需成本实测 |
| TP-072 | pack 隐私/依赖/文档/禁发布 | 产物无秘密，未授权不执行发布 |

## 交付证据分层

| 层 | 覆盖 | 不可替代 |
|---|---|---|
| L0 文档校验 | 文件/链接/围栏/需求测试追踪 | 任何运行能力 |
| L1 core fixture | TP-009–TP-050 的纯核心部分 | 实际 shell/报告/会话授权 |
| L2 宿主集成 | collector、RPC、session、PTC | fresh profile 与 packed client |
| L3 fresh profile/Web/headless | TP-065–TP-070 | 其他 OS 或 runner 版本 |
| L4 资源与隐私审计 | TP-046–TP-056、TP-071–TP-072 | 安全审计/公开发布授权 |

一个用例含多个子场景时必须列出各自结果。可宣告 LOCALLY_TESTED 的是精确已测组合，不是所有 provider、所有版本或全部产品。D0 不授予此状态。
