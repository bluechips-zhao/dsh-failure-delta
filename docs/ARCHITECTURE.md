# 架构设计

## 1. 架构总览

```text
DSH native bash/pwsh call
        |
tools/execute: start/end identity capture (next once, no rewrite)
        |
tools/result: immutable FINAL canonical result (sync observe)
        |
bounded per-session queue
        |
canonical DTO validator + command recognizer
        |
runner parser ---- optional confined fresh artifact reader
        |
RunRecord + Diagnostic/TestInventory
        |
comparability gate -> deterministic multiset/test-state comparator
        |
bounded memory store (epoch + revision)
        +--> read-only model query tool (on demand)
        +--> scoped Host Remote -> Web panel (automatic display update)
```

DSH 的最终 result 不得被 collector 改写。Host/Client 只呈现派生事实，不改变 tool policy 和 Agent loop。

## 2. 候选公共 seam

- `tools/execute`：围绕获准 dispatch 的 wrapper，捕获开始序号、session、调用 token、候选 cwd、command digest；`next()` 恰好一次，结果/异常原样返回。
- `tools/result`：同步 emit listener，取得冻结最终 outcome；只做有界抽取和入队，返回 undefined，不返回 Promise。
- 规范前台 DTO：`kind=foreground`、exitCode、signal、timedOut、aborted、stdout/stderr.text/truncated。
- Client：通过官方 `dsh.client`/`./client` bundle 与 right sidebar tab 扩展注册看板。
- Remote：使用官方 lookup + codec/授权路径，而非裸 HTTP sessionId 查询。

seam 是 D0 官方源码支持的候选；注册方式、外部构建器和实际 profile 行为必须 D1 证明，参见 [上游基线](UPSTREAM-BASELINE.md)。

## 3. 模块划分

| 计划模块 | 职责 |
| --- | --- |
| `host/plugin.ts` | 配置、注入、生命周期、注册 observer/query/controller |
| `host/collector.ts` | start/end capture、规范 DTO、token 去重、队列 |
| `host/artifacts.ts` | opt-in provider containment、freshness、bounded read |
| `core/commands.ts` | 受限命令语法、profile 分类、原命令不落日志 |
| `core/parsers/*` | 纯 runner parser 与版本窗口 |
| `core/normalize.ts` | ANSI/路径/脱敏、语义 identity，不执行输入 |
| `core/comparability.ts` | 三等级判定和原因码 |
| `core/compare.ts` | diagnostic multiset + test transition |
| `core/store.ts` | 有界内存运行/索引/revision/epoch |
| `host/controller.ts` | session-scoped、分页、read-only DTO |
| `host/query-tool.ts` | `failure_delta_query`，不运行检查 |
| `client/*` | tab、列表、差分、状态、可访问性 |

目录仅为实现蓝图，当前没有这些源码。

## 4. 生命周期与采集

### 4.1 默认路径

1. 所有 start capture 以 registry token 为内部关联键；session 必须由 `exec.agent` 的宿主对象得到。
2. 为 run 分配递增 startSeq 和 runId；记录观测时刻，不冒称进程真实开始时间。
3. 不执行 runner/version 命令、不额外读文件；未知 metadata 明示 unknown。
4. 调用 next，原 outcome/throw 原样返回。仅 recorder 自身错误被隔离。
5. 最终 tools/result callback 取得 canonical result；失败结果没有 success value，不能从 content 伪造 exitCode。
6. foreground DTO 完整且 command 受支持则 bounded enqueue；background handle 标记 unsupported-background。
7. worker 解析、生成脱敏 RunRecord，并原子提交 revision。

默认部分运行会只有 observational 等级，但仍能展示真实观测的错误变化。

### 4.2 opt-in 元数据与 artifact

只有用户配置的 profile 可以读取明确列出的 runner/config/lockfile 摘要与 reportPath。start wrapper 在 next 前、next 返回后分别捕获 bounded metadata；读失败只降级看板，不改变 next。异步文件操作必须遵守 cancellation 并等待自有工作结束，不能 Promise.race 后遗弃 I/O。

artifactPath 必须对应解析到的 reporter 参数，归属于当前运行，而且启动前不存在；读取期间有身份/大小稳定性检查。已有固定文件、相同路径并发写、mtime-only 或报告内容声明的时间均不算可信新鲜证明。不能自动删旧报告或改写命令来取得 freshness。

## 5. 比较时序

- startSeq 决定运行顺序，完成顺序仅用于显示。
- 自动 baseline 只能取同一 series 已完成、且在当前 run 开始前完成的最近支持运行。
- 若同组运行重叠或存在未清楚关联的结果，不做 certified 改善比较，理由 overlapping-run。
- 按 session 串行提交 revision；允许处理完成乱序，但基线始终按 startSeq 与开始前已完成事实选取，不等待未结束的早期运行阻塞整个看板。
- 手选 baseline 同样执行 comparability gate，不能绕过降级。
- config/parser 变化切新 series；不把代码 source revision 变化当不可比，因为修复本就会改源码。

## 6. 数据与信任

- Runner 输出、JSON/XML 报告与命令均不可信，按普通数据解析。
- 基于 observed result 的 passed 记录是“本次 runner 报告通过”，不是对恶意 runner 的密码学证明。
- parsed canonical value 执行期可见，不等于可从会话重放重建；v1 不依赖历史 raw content 反推 exitCode。
- 原日志定位使用官方调用导航：session、rootCallId、callId 与来源类型。不得猜 URI、自动打开 spillPath 或泄露绝对私人路径。

## 7. 资源隔离

- tools/result listener 只持有 bounded copied capture，不把整个 result/agent/session 对象保留到 worker。
- per-session queue、global queue bytes、runs、diagnostics、test inventory 和 snapshots 都有硬上限。
- queue 满：生成 dropped tombstone/health counter；禁止提交“零错误”记录。
- 解析限额：partial 标志及观察等级降级；缺失项进入 unconfirmed，不计入改善。
- registry token 是内部 symbol，只存在 bounded Map，不序列化；终态/TTL/卸载释放。
- parser 运行预算通过输入/节点/行上限约束；危险 regex 或 XML 实体不能执行。

## 8. UI/Remote 隔离

- Host 为数据权威，Client 不重新算 delta。
- RPC 使用 Host 解析且有权访问的 Session lookup；任意 runId/seriesId 需再次检查归属。
- 客户端快照带 epoch/revision；断线标记 stale，重连 full snapshot；不能显示旧 session 数据。
- v1 只读接口：list/get/compare/health；手选 baseline 是查询，不写宿主策略。
- Remote push 若外部 SDK 不可用，允许 scoped unary refresh，仅在面板可见时以有界频率拉取；不绕过认证。
- 关闭面板后停 polling/subscriptions；unload 移除所有 effect。

## 9. 降级不改变执行

录制器/解析器/Remote 出错时，面板显示 unavailable/partial/unsupported。原工具继续原来语义；不吞错、不触发重试、不追加 LLM 提醒。看板可用性不是执行安全 boundary。

## 10. 实现目录蓝图

```text
dsh-failure-delta/
├── package.json                 # future only
├── cordis.patch.yml             # unique row failure-delta
├── src/core/
├── src/host/
├── src/client/
├── test/{fixtures,unit,property,integration,e2e}/
└── docs/
```

package 将同时声明 `dsh.bundle` 和 `dsh.client` 的各自语义；这不意味着一个 package 是 profile。headless 可只使用 Host/query，Web panel release 仍需真实 Client 验收。
