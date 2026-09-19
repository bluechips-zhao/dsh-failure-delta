# 项目工作规则

适用于本目录内所有人员和 Agent。目标是按已批准设计实施、交接和验收，不凭旧对话自由重新设计。

## 文档权威

1. 用户当前明确指令。
2. 本文件。
3. `docs/DECISIONS.md`、`docs/TECHNICAL-SPEC.md`、`docs/DATA-MODEL.md`、`docs/PARSER-SPEC.md`。
4. 架构、威胁模型、UI、测试、追踪和交接文档。
5. README、注释、历史记录。

冲突必须报告并通过 ADR 解决，不得暗改。不同项目的 AGENTS 不是本项目的接口规范。

## 每次工作必须记录

先在 `docs/COLLABORATION-LOG.md` 追加 STARTED；结束时追加 COMPLETED、BLOCKED 或 ABORTED。写明 Asia/Shanghai、UTC、执行者、工作目标、文件归属、实际操作、解决事项、验证命令/退出码、未解决事项和下一步。纠错只追加 CORRECTION。

## 实现前 D1 官方预检

从官方在线仓库或验证无改动的官方 pinned checkout 核对：

- `tools/execute`、`tools/result` 签名、模式、作用域和 PTC nested 调用；
- ToolExecution token、agent/session、不可变参数及规范化最终 result；
- 原生 bash/pwsh foreground DTO、workdir 解析、截断/超时/取消；
- canonical value 的执行期可见性与会话持久化差异；
- bundle 插入、发布包公共导出、Node/pnpm；
- Client bundle 格式、sidebar 扩展、remote codec 注册与授权。

更新 `UPSTREAM-BASELINE.md`，记录 commit/tag、时间、证据和结论。解析器另核对 runner 的精确版本及官方 schema；不得用最新版文档代替旧版本 probe。

## 停止条件

- 得不到可信 foreground exitCode、截断和取消信息；
- 无法确认 session/调用归属或 PTC 是否重复通知；
- UI 必须修改官方源码、私有 reflection、DOM monkey patch 或未授权 HTTP 路由；
- 外部包不能生成/注册官方 remote codec 或 Client 格式；
- 必须替换官方同 ID Loader row；
- 解析器必须运行用户项目代码才能读取配置；
- 无法防止 session 越权查询、路径越界、XML 外部实体或日志 HTML 执行；
- 需要读任意 spillPath、扫描任意文件或持久化原始日志；
- 尚未定义未知/超限/截断的降级语义。

触发后停止对应工作包并报告；不能把静默降级成只有 CLI 的产品称为 Web 看板完成。独立纯核心工作仍可在范围内继续，状态必须区分。

## 冻结范围

- advisory 看板；不拦截完成、不自动重试、修复或启动命令。
- 默认 passive capture + 内存派生记录；不改原 value/content/exitCode/权限。
- 默认不读额外报告文件；配置后只读指定 workspace 内的新鲜 artifact。
- 不注入每轮模型提醒；查询工具按需使用。
- 不记录凭据、完整命令、原日志、提示词或推理；UI 用脱敏短摘录。
- 不以错误消失证明修复、因果或全部测试通过。
- Windows PowerShell 7 和 bash 是分别验证的运行路径。
- 不声称 GitHub/市场绝无同类。

## 工程纪律

- TypeScript ESM；纯 parser/comparator 与 Cordis/Client 隔离。
- 所有集合、字符串、队列、RPC 分页都有上限。
- recorder 失败只能使看板 unavailable/dropped，不能吞掉原工具异常或改变结果。
- 不执行 package scripts、TS 配置或 Python 模块来获取元数据。
- 修改设计先更新 ADR、FR、TP 和 TRACEABILITY。
- 保留用户已有修改；若并行工作经用户授权，明确文件/工作树归属，不能回退他人改动。
- 状态等级按 ACCEPTANCE-CRITERIA：DESIGN/CORE_TESTED/HOST_TESTED/LOCALLY_TESTED；SOURCE、FRESH_PROFILE_VERIFIED、Web/headless、平台/provider 与 PUBLISHED 另列具体证据，不能互相替代。
- mock、构建、配置 dump 和静态截图不等于真实宿主可用。

Git 初始化、提交、安装进常用 profile、远端仓库和 npm 发布不属于当前 D0 授权。
