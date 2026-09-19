# 官方上游基线与实现预检

## 本次查证范围

查证日期：2026-09-19（Asia/Shanghai）。来源为官方 GitHub、官方 runner 文档及相邻项目作者仓库；不将本机已修改 DSH 当作官方事实。以下是源码/文档预检，不是兼容性、安装或运行证明。

| 项目 | 本次结果 |
|---|---|
| 官方仓库 | [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) |
| git ls-remote HEAD | ddefc45fbc7f8e46dd73185e68295696d1297887 |
| 根 version | 0.1.6-alpha.2 |
| engines.node | ^22.19.0 \|\| >=24.0.0 |
| packageManager | pnpm@11.7.0 |
| 实际 Host/Client/fresh profile | 未执行 |

版本字段来自 [固定 SHA 的 package.json](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/package.json)。这些是官方仓库声明，不要求本阶段安装它们，也不保证未来 HEAD 不变。

## 已确认的公共契约

### 工具事件

[core/tools](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/core/tools/src/index.ts) 声明 tools/execute 为异步 waterfall，next 返回规范结果。exec 的允许替换字段限于 signal；本插件不修改它。tools/result 为同步 undefined 监听，获得执行身份及最终冻结 JSON 结果，规范 value 不作为耐久会话状态保存。

身份含 callId、rootCallId、agent、parent/token；嵌套调用不能从 ID 文本推断归属。成功与工具失败为不同分支；仅成功 value 内的 foreground DTO 才是进程输出输入。执行事件的真实触发、PTC、监听顺序和异常隔离仍需 D1/D3 probe。

### 原生 shell

[bash](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/shell/tool-bash/src/index.ts) 与 [pwsh](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/shell/tool-pwsh/src/index.ts) 的 foreground value 含 kind、exitCode、signal、timedOut、aborted、timeoutMs、stdout/stderr；输出项含 text、truncated 和可选 spillPath。background value 仅为 jobId 句柄，不代表完成。取消可能产生工具失败而不是正常 foreground 值。

实际执行目录可受 shell/workspace 策略解析影响，不能单看会话 cwd。[shell 子系统](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/subsystems/shell.md) 区分 request/spec 解析；输出捕获扩容不是可以随意修改的模型参数。本插件禁止自动调大捕获预算。

### 文件提供者

[filesystem 子系统](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/subsystems/filesystem.md) 使用 opaque target、resolve/contains 与执行路径映射。不得解析 targetKey 或用字符串前缀证明工作区内路径。外部插件能否使用所需受约束读取、身份和稳定读取能力，尚需证明；能力不足禁用报告资格，不直接使用本机 fs 绕过。

### Client、Remote 与 UI

[client modules](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/subsystems/client-modules.md) 描述 package 的 dsh.client、Web 注入关系与构建模块；不是任意 Vite ESM 均能加载。[Remote cookbook](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/cookbook/adding-a-remote-api.md) 使用 TypertRemoteService、@Remote、Agent/Session 顶层解析与生成的 codec。外部包生成流程必须实测，不能猜 HTTP endpoint。

候选 UI 入口为 [sidebar-right README](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/client/ui-sidebar-right/README.md) 中的 sidebarRight/sidebarRightTabs 与 [ui-slots README](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/packages/client/ui-slots/README.md)。本文没有冻结未验证的组件签名、导航方法或订阅 API。D1 要明确精确导出、会话状态与原调用导航能力。

[publish 文档](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/docs/user/develop/basic/publish.md) 是 bundle 元数据候选依据；此插件采用新唯一行，不用同 ID 替换。[SAFETY](https://github.com/deepseek-ai/deepseek-harness/blob/ddefc45fbc7f8e46dd73185e68295696d1297887/SAFETY.md) 明示实验性/未审计性质，不能将权限或 sandbox 当作完备安全保证。

## runner 官方依据

| 官方资料 | 设计影响 | 未证明事项 |
|---|---|---|
| [Vitest reporters](https://vitest.dev/guide/reporters) | JSON reporter 提供用例状态；stdout 可能夹杂日志，文件输出须新鲜 | 各旧版本 schema 和本机 runner 实际版本 |
| [pytest output](https://docs.pytest.org/en/stable/how-to/output.html) | JUnit 是候选结构化来源，字段/范围须验证 | 完整 collection、插件及分布执行语义 |
| [pytest cache](https://docs.pytest.org/en/stable/how-to/cache.html) | last-failed 已存在，重跑并非本插件创新 | 本插件不执行此能力 |
| [TypeScript pretty](https://www.typescriptlang.org/tsconfig/pretty.html) | 非 pretty 文本利于限定解析 | 不能据此宣称 tsc 有通用 JSON reporter |

runner 网页是滚动文档，D1 需记录抓取日期、安装版本与实际 schema/fixture hash。当前只证明设计有官方依据，不授予支持窗口。

## D1 必交预检表

| 检查 | 必交证据 | 失败动作 |
|---|---|---|
| 官方 SHA/本机差异 | ls-remote、选定 SHA、git status、实际版本 | 不覆盖本机改动；漂移需评审 |
| 包与事件导出 | 外部插件最小 probe、真实 execute/result | 停止伪接口实现 |
| cwd/scope 元数据 | 实际执行坐标取得方式、unknown 分支 | 只能有限观察 |
| PTC/session/token | 实际嵌套身份及无 Agent 场景 | 限定支持，不猜归属 |
| 约束文件读取 | provider/contains/身份/TOCTOU probe | 禁用报告读取或仅有限文本 |
| runner 支持窗口 | 真实版本、输出、schema、测试清单 | 不支持或降级 |
| Client/Remote 构建 | codec 外部生成、bundle/导出真实加载 | 标 Web BLOCKED，不私有绕路 |
| UI/原调用定位 | 精确组件/导航签名与真实展示 | 缺定位则禁入口；缺 UI 则 partial |
| fresh profile 授权 | 独立 profile 路径与用户许可 | 未授权不安装或改公共配置 |

停止条件完整列表以 [AGENTS](../AGENTS.md) 为准。D1 只允许收紧范围/明确未知；扩大到后台、持久化、自动命令或完成门禁需用户批准。

## D1-20260919-004：固定 SHA 只读 probe

本轮从官方仓库 clone 到临时目录，仅 checkout 固定 SHA `ddefc45fbc7f8e46dd73185e68295696d1297887`；项目工作区没有被上游文件覆盖。临时 checkout 的 `git rev-parse HEAD` 与目标 SHA 一致，官方 `git ls-remote ... HEAD` 仍返回同一 SHA。未执行官方 package scripts、TS 配置或 runner 项目代码。

### 已直接核对

- `packages/core/tools/src/index.ts`：`tools/execute` 是 `waterfall`，签名为 `(exec, next) => Promise<ToolExecutionResult>`；around listener 可替换的字段仅为取消信号语义，调用身份保持不变。`tools/result` 是 `emit`，签名为 `(Readonly<ToolExecution>, Readonly<ToolExecutionResult>) => undefined`；最终结果在通知前深冻结，listener 异常被记录并隔离。执行 token 由宿主生成的 `Symbol`，nested PTC 通过不透明 `parent` token 关联，不能解析 callId 文本猜父子关系。参数和值在规范化边界经过 lossless JSON snapshot/deepFreeze。
- `packages/shell/tool-bash/src/index.ts` 与 `packages/shell/tool-pwsh/src/index.ts`：两者 foreground 成功 value 共同使用 `kind=foreground`、`exitCode`、`signal`、`timedOut`、`aborted`、`timeoutMs`、`stdout/stderr { text, truncated, spillPath? }` 及可选 sandbox facts；background value 只有 `kind=background` 与 `jobId`。schema 的 `additionalProperties=false` 与 foreground/background `oneOf` 已核对。工具失败不是 foreground value，取消/准备失败可能走失败分支。
- `packages/shell/shell/src/types.ts`：`ShellRunResult` 的非零退出、超时和 abort 仍 resolve；基础设施/准备失败才 reject；`CollectedOutput` 明确含 `text` 与 loss/truncation 事实。模型工具的 `workdir` 可缺省，工具实现从调用 Agent 的 session cwd 派生；无 Agent 时不应伪造 session 坐标。实际 provider 执行目录仍需宿主 probe 证明。
- `docs/subsystems/filesystem.md` 与 `packages/fs/fs/src/types.ts`：报告读取只能通过 `ctx.fs` 的 opaque target；`resolve`、`stat`、`contains`、`processPath` 是 provider API，消费者不得解析 targetKey 或用字符串前缀证明包含关系。D1 只证明安全 seam 存在，未证明外部插件在目标安装布局能取得所需 session workspace provider。
- `packages/api/remotes`、`docs/cookbook/adding-a-remote-api.md`：Host 端需继承 `TypertRemoteService`、使用 `@Remote`，`Agent`/`Session` 只能作为顶层 lookup 参数；package 需导出生成的 host/remote-client artifacts，Client 通过 `ctx.remote.<namespace>.<method>` 调用，不能手写 relay 或猜 HTTP。改动签名/namespace/export 需运行官方 `build:lib` 生成声明与 codec；本轮未运行生成器。
- `packages/client/ui-sidebar-right/README.md` 与 `ui-slots` 文档：公开入口是 `ctx.sidebarRight`、`ctx.sidebarRightTabs.register(...)`、`ctx.slots.register({ name: 'sidebar.right.pane.tab', key })` 与 `useTabInfo()`；原调用/资源导航通过 `openResource`/`openTab`。未使用 DOM monkey patch 或私有 state 的理由得到源码支持，但真实外部包 Client bundle 仍未构建/加载。
- 官方 package manifests：bundle 行使用 `dsh.bundle.patch`；Client 行使用 `dsh.client.platform=web`、`inject` 和可选 `external`，通常有 `bundle` script。项目未来 package 可按此元数据接入，但不能以 manifest 静态存在代替 packed/fresh-profile 证据。

### D1 结论与降级

- D1 的静态官方契约已更新为 `SOURCE` 证据；官方 SHA、事件签名、最终 canonical result、shell DTO、opaque fs、Remote/Client 生成方向均有固定 checkout 证据。
- `HOST_TESTED` 仍未授予：尚未在实际 DSH composition 中证明 listener 顺序、真实 Session/PTC 归属、provider TOCTOU、foreground exit/truncation/cancel 观察或原工具 A/B 不变。
- `Web/headless/fresh-profile/PUBLISHED` 均未授予：未构建外部 Remote codec、未加载 packed Client、未安装隔离 profile，也未执行 GitHub/npm 发布。
- 因此本轮允许实现与验证纯核心和宿主无关的 bounded adapter；所有真实 DSH 接入、文件报告读取、Remote/Client 入口必须保持显式未验证状态，不能写成“Web 完成”。
