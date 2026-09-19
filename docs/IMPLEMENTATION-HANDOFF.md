# 实现交接书

项目根目录：I:\Codex\dsh-failure-delta。当前已完成 D1 固定 SHA SOURCE probe，并有 D2 纯核心与宿主无关 adapter；真实 DSH Host/PTC、Client/Remote、fresh profile、Web/headless、跨平台和发布证据仍未取得。交接不是保证任何人无需判断即可完美实现；本文件把可执行规格、未知项、停止条件与验收责任显式化。

## 阅读顺序

1. 完整阅读根目录 AGENTS.md、README.md、CONTRIBUTING.md。
2. 完整阅读 PROJECT、ARCHITECTURE、TECHNICAL-SPEC、PARSER-SPEC、DATA-MODEL。
3. 完整阅读 UI-UX、THREAT-MODEL、DECISIONS、UPSTREAM-BASELINE、NOVELTY。
4. 完整阅读 TEST-PLAN、TRACEABILITY、ACCEPTANCE-CRITERIA、COLLABORATION-LOG 和本文。

不得只看本交接提示后实现。文档冲突按 AGENTS 权威次序解决；发现冲突追加协作记录，不能自行扩展冻结范围。

## 工作包与责任

| 工作包 | 责任文件/模块（实施后才创建） | 出口 |
|---|---|---|
| WP-0 / D1 | upstream probe、支持窗口、DECISIONS/基线更新 | 接口与目录/报告/UI 停止条件处理清楚 |
| WP-1 / D2 | core command/parser/fingerprint/comparison、合成 fixtures | 纯核心 oracle/property/fuzz（本轮局部 fixture 已通过） |
| WP-2 / D2 | bounded store/queue/epoch/redaction | 超限与隐私、并发测试（本轮 bounded store/adapter 已通过，性能未测） |
| WP-3 / D3 | host collector/query、PTC/session | 原工具不变、真实事件与授权 |
| WP-4 / D3 | remote controller/codec、client panel | 授权查询、等级与原调用入口 |
| WP-5 / D4 | package/bundle、fresh profile、Web/headless | packed artifact 与真实 OS/runner 矩阵 |
| WP-6 / D4 | acceptance evidence、README 支持声明、协作终态 | 逐项 PASS/FAIL/BLOCKED/NOT RUN |

本轮已由接手者单独执行 WP-0 与 WP-1/WP-2 的局部核心工作；WP-3–WP-6 仍需真实宿主/打包证据。若用户后来明确授权团队协作，队长负责范围/集成/验收，worker 明确文件归属、隔离 worktree 并不得回滚他人修改。worker 必须汇报文件、提交（如有）、验证、阻塞和残余风险。Git 初始化/提交/推送边界以当前用户授权和发布前预检为准，不得把本地准备误当远端发布。

## 冻结范围与禁止事项

v1 原生 bash/pwsh foreground、有限 runner、Web + 按需查询、内存派生记录。后台/MCP/IDE、自动重跑/修复、完成门禁、持久化、跨会话聚合、全文导出不在范围。

不得自动修改其他 DSH 项目、公共 profile、权限或 sandbox；不得删除旧报告以通过新鲜度检查；不得发布 npm/GitHub 或上传原日志。源码检查、mock、构建、配置 dump 都不能证明实际可用。

## 可复制的新对话提示词

```text
请接手 I:\Codex\dsh-failure-delta，按已经冻结的 D0 文档开始实施。
先完整阅读 AGENTS.md 及 IMPLEMENTATION-HANDOFF.md 指定的全部文档，核查当前工作区和协作书；不要依赖旧对话摘要或只读 README。
先追加 STARTED（北京时间、UTC、谁、目标、文件归属、实际动作、待解决问题），再执行 WP-0 / D1 官方上游与 runner 预检，记录精确 SHA、包导出、原生 foreground 结果、Session/PTC、实际 cwd、报告约束、Client/Remote 生成链路和 UI 扩展点。
本项目是被动错误变化看板，不是自动修复器或完成门禁。默认不额外读写工作区、不执行附加命令、不读 spillPath、不注入模型提醒；只保存内存派生数据。
必须严格区分完整可比、有限观察、不可比较。截断、跳过、缺失、范围缩小、并发或环境未知不得认定已修复；测试本次通过需显式 passed，诊断消失不证明因果。
遇到 AGENTS 的停止条件先报告，不使用私有 API/DOM/猜 HTTP/本机 fs 绕路，也不擅自加后台、持久化或自动重跑功能。
完成每个工作包后按 TRACEABILITY、TEST-PLAN 和 ACCEPTANCE-CRITERIA 验证，分别记录 core/mock/真实 Host/PTC/fresh profile/Web/headless/OS/runner/pack 证据；未执行不得写 PASS。
先做可以在项目内安全完成的实现。涉及独立 profile 安装、真实外部环境、公共配置、权限变更、删除、网络发布或未明确授权的 Git 操作时，说明准确目标与影响并请求授权。
每次实质工作必须追加对应 COMPLETED/BLOCKED/ABORTED，写明时间、谁、做了什么、解决了什么、实际证据、未执行和剩余风险；不要改历史。
```

## 首次实施必须回答的未知项

- 实际执行目录和 runtime/environment 可取得什么证据？不足则降级，不能把 profile 声明当观测。
- 文件提供者能否在正确执行世界证明报告路径/身份/稳定读取？不行则禁止报告资格。
- 外部插件的 codec、client module、官方侧栏、原调用导航能否真实构建加载？若阻塞不能声称 Web 完成。
- 各 runner 精确支持版本及失败/通过/清单格式是什么？不能从滚动网页猜所有版本。
- 最终规范值可能被其他策略改变；只能声明观察到的宿主结果，不能证明模型所见或程序因果。
