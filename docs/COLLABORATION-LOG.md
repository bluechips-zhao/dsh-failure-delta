# 协作书

本文件仅追加。每次实质工作必须有 STARTED 和对应 COMPLETED / BLOCKED / ABORTED 记录；纠错另追加 CORRECTION，不改历史。所有记录写明北京时间、UTC、执行者、目标、文件归属、做了什么、解决了什么、证据和剩余事项。

## COL-20260919-004 — 持续推进至 GitHub 推送前

- 状态：STARTED
- 时间（Asia/Shanghai）：2026-09-19T00:29:55+08:00
- 时间（UTC）：2026-09-18T16:29:55Z
- 执行者：Codex/root
- 关联记录：COL-20260919-003
- 工作项：遵循项目文件继续推进实现与必要验证；减少重复和低价值测试；到达可推送 GitHub 但未推送的状态后请求用户确认。
- 文件归属：仅 Codex/root 负责 I:\\Codex\\dsh-failure-delta；不修改其他项目、公共 profile 或远端。
- 计划动作：先审计现状和文档缺口，再按最小证明集实施；未到推送确认点前不执行提交、推送、发布、安装或其他外部状态变更。
- 当前待解决问题：上一轮记录仍显示项目处于 D0 文档阶段，源码、包和 D1/宿主证据待核实。
- 未授权动作：GitHub 推送、npm 发布、公共 profile 安装、权限变更、删除及其他外部状态变更。

## COL-20260919-004 — 持续推进至 GitHub 推送前

- 状态：COMPLETED（达到外部推送确认边界）
- 时间（Asia/Shanghai）：2026-09-19T00:52:38+08:00
- 时间（UTC）：2026-09-18T16:52:38Z
- 执行者：Codex/root
- 关联记录：COL-20260919-004 STARTED
- 工作项：按冻结文档从 D0 推进到 D1 SOURCE、D2 核心局部 `CORE_TESTED`，减少重复测试，并准备本地 Git 推送候选。
- 文件归属：仅 I:\\Codex\\dsh-failure-delta；本轮新增/修改源码、测试、package、锁文件和文档均归 Codex/root；未修改其他项目、公共 profile 或远端。
- 做了什么：固定 SHA `ddefc45fbc7f8e46dd73185e68295696d1297887` 官方只读 probe；实现命令识别、tsc/Vitest/pytest 受限 parser、HMAC 语义身份、摘录脱敏、有界 store、三档比较和 host-neutral canonical/observer adapter；补齐 package/TypeScript ESM、11 个核心测试、README/验收/测试计划/交接/官方基线；初始化本地 `main` 并创建首个提交。
- 解决了什么：默认 parser 使用进程级随机 key 保证同一 epoch 跨运行可匹配；明确截断/未知/范围变化/实体/重复测试/缺失 passed 的降级；background/tool failure 不再伪造成功运行；store 按 startSeq 选基线并暴露淘汰健康计数；pack 产物不含源码测试和 node_modules。
- 验证命令/退出码：`pnpm install --frozen-lockfile --ignore-scripts` 0；`pnpm typecheck` 0；`pnpm test` 0（2 files / 11 tests passed）；`pnpm build` 0；`node --input-type=module -e ...` exports smoke 0；`pnpm pack --dry-run` 0；Markdown 围栏检查 0；`git diff --cached --check` 0；工作树 `git status --porcelain` 为空。
- 本地提交：`13b88840248df56b74736c5fcc7711603a2b20da`，`feat(core): add evidence-aware failure delta core`，本地作者为 `Codex <codex@localhost>`；仓库无 remote 配置。
- 证据等级：D1 `SOURCE`；核心 `CORE_TESTED`（局部）；真实 DSH Host/PTC、runner 版本样本、provider TOCTOU、Client/Remote codec、Web/headless、fresh profile、跨平台和 PUBLISHED 仍未授予，见 `docs/UPSTREAM-BASELINE.md` 与 `docs/ACCEPTANCE-CRITERIA.md`。
- 未执行：GitHub push、npm publish、远端仓库创建、公共 profile 安装、权限变更、删除、真实 DSH 组合测试和任何自动重跑/修复。
- 下一步：向用户确认目标 GitHub remote、目标 branch 及是否推送当前 commit；得到明确授权后再执行发布前 preflight 和 push。

## COL-20260919-005 — 修正本地提交作者元数据

- 状态：STARTED
- 时间（Asia/Shanghai）：2026-09-19T09:02:05+08:00
- 时间（UTC）：2026-09-19T01:02:05Z
- 执行者：Codex/root
- 关联记录：COL-20260919-004
- 工作项：按用户指令将本地提交作者名改为 `bluechips`；不推送、不配置远端。
- 文件归属：仅 I:\\Codex\\dsh-failure-delta 的 Git 提交元数据和本协作记录。
- 当前待解决问题：Git 提交对象的邮箱字段未由用户单独指定；项目文档不展示邮箱，远端目标仍未确认。

## COL-20260919-005 — 修正本地提交作者元数据

- 状态：COMPLETED
- 时间（Asia/Shanghai）：2026-09-19T09:02:46+08:00
- 时间（UTC）：2026-09-19T01:02:46Z
- 执行者：Codex/root
- 关联记录：COL-20260919-005 STARTED
- 做了什么：重写本地三条提交的 author/committer 名称为 `bluechips`；Git 提交对象按格式保留必需的邮箱字段，但项目文档不展示邮箱；未配置 remote，未执行 push。
- 解决了什么：移除此前的 `Codex <codex@localhost>` 提交身份，当前历史可按用户指定 GitHub 名称继续做 push 前检查。
- 验证命令/退出码：`git rebase --root --exec ...` 0；`git log --format=...` 显示三条提交名称均为 bluechips；`git status --short --branch` 为空。
- 未解决事项：Git 提交对象仍需邮箱字段，项目文档不展示该字段；GitHub remote、branch 和 push 授权仍待确认。
- 下一步：等待用户确认远端目标和 push。

## COL-20260919-007 — GitHub 推送预检

- 状态：STARTED
- 时间（Asia/Shanghai）：2026-09-19T09:32:13+08:00
- 时间（UTC）：2026-09-19T01:32:13Z
- 执行者：Codex/root
- 关联记录：COL-20260919-006
- 工作项：按用户明确授权执行 GitHub 推送前的只读预检，并在目标明确且检查通过后推送当前 `main`。
- 文件归属：仅 I:\\Codex\\dsh-failure-delta；不修改源码，不发布 npm，不改变公共 profile。
- 当前边界：本地尚未配置 Git remote；目标仓库 URL、默认分支保护和 GitHub 认证状态需先核实。

## COL-20260919-008 — 仓库创建尝试结果

- 状态：BLOCKED
- 时间（Asia/Shanghai）：2026-09-19T09:34:16+08:00
- 时间（UTC）：2026-09-19T01:34:16Z
- 执行者：Codex/root
- 关联记录：COL-20260919-007
- 工作项：按用户授权创建 GitHub 仓库并推送；同时将项目包元数据作者设为 `bluechips`。
- 做了什么：检查 GitHub CLI、浏览器会话和本机 Git 凭据通道；补充 `package.json` 的 `author: bluechips`。
- 解决了什么：项目包作者字段已明确为 `bluechips`。
- 验证命令/退出码：GitHub CLI 检查确认未安装；浏览器创建页检查确认浏览器不可用；未执行远端创建或 push。
- 未解决事项：当前环境没有可用 GitHub 登录/API 通道，无法代表用户创建远端仓库。
- 下一步：用户在本机安装并登录 GitHub CLI，或提供可用的 GitHub 连接后，继续创建仓库并 push。

## COL-20260919-009 — 创建公开 GitHub 仓库并推送

- 状态：STARTED
- 时间（Asia/Shanghai）：2026-09-19T09:35:05+08:00
- 时间（UTC）：2026-09-19T01:35:05Z
- 执行者：Codex/root
- 关联记录：COL-20260919-008
- 工作项：按用户最新指令将仓库设为公开，创建 GitHub 远端并推送当前 `main`。
- 文件归属：仅 I:\\Codex\\dsh-failure-delta；不修改源码和 npm 发布状态。

## COL-20260919-009 — 创建公开 GitHub 仓库并推送完成

- 状态：COMPLETED
- 时间（Asia/Shanghai）：2026-09-19T09:39:14+08:00
- 时间（UTC）：2026-09-19T01:39:14Z
- 执行者：Codex/root
- 关联记录：COL-20260919-009 STARTED
- 做了什么：使用已授权的 GitHub CLI，以账号 `bluechips-zhao` 创建公开仓库 `dsh-failure-delta`；配置 `origin` 并推送 `main`。
- 解决了什么：公开 GitHub 远端已建立，当前本地与远端 `main` 已同步。
- 验证命令/退出码：`gh repo view ... --json name,visibility,url,defaultBranchRef` 0，返回 `PUBLIC`、默认分支 `main` 和仓库 URL；`git ls-remote origin refs/heads/main` 0，远端 SHA 为 `05475aa93fb26c3afa6d67909f67e00dcb46dcdc`；`git status --short --branch` 显示 `main...origin/main`。
- 未解决事项：无本次推送阻塞；Web/fresh profile/provider/PUBLISHED 等项目证据仍未获得，不因本次 GitHub 推送改变状态。
- 下一步：将本次完成记录提交并推送到公开仓库。

## COL-20260919-010 — 统一 GitHub 作者身份

- 状态：STARTED
- 时间（Asia/Shanghai）：2026-09-19T09:43:29+08:00
- 时间（UTC）：2026-09-19T01:43:29Z
- 执行者：Codex/root
- 关联记录：COL-20260919-009
- 工作项：按用户确认，将项目作者字段、现有 Git 提交以及后续提交统一为 GitHub 账号 `bluechips-zhao`。
- 文件归属：仅 I:\\Codex\\dsh-failure-delta；源码内容不变。
- 计划动作：更新 package 作者字段；保留当前 HEAD 的本地备份引用；重写本地提交 author/committer 元数据；使用 force-with-lease 更新公开远端；核验远端提交归属和工作区。
- 风险边界：公开仓库提交历史会因作者元数据修正而改变，但文件内容和提交消息保持不变。

## COL-20260919-007 — GitHub 推送预检结果

- 状态：BLOCKED
- 时间（Asia/Shanghai）：2026-09-19T09:32:42+08:00
- 时间（UTC）：2026-09-19T01:32:42Z
- 执行者：Codex/root
- 关联记录：COL-20260919-007 STARTED
- 做了什么：检查工作区、当前 `main`、提交历史、tracked 文件、敏感信息/绝对路径模式和 `git diff --check`；尝试只读探测按 `bluechips/dsh-failure-delta` 推定的 GitHub URL。
- 解决了什么：确认工作区除本协作日志 STARTED 记录外无源码变更；未发现凭据样式；差异检查通过。
- 验证命令/退出码：`git status --short --branch` 0；`git diff --check` 0；候选 URL 的 `git ls-remote` 返回 128（Repository not found）。
- 未解决事项：仓库没有配置 remote，候选 GitHub URL 不存在或当前认证不可见；无法在不猜测目标的情况下执行 push。
- 下一步：用户提供准确的 GitHub repository URL 后，继续 remote 配置、目标分支核对和 push。

## COL-20260919-006 — 修正作者展示方式

- 状态：STARTED
- 时间（Asia/Shanghai）：2026-09-19T09:07:39+08:00
- 时间（UTC）：2026-09-19T01:07:39Z
- 执行者：Codex/root
- 关联记录：COL-20260919-005
- 工作项：按用户更正，将项目文档中的作者展示改为仅 `bluechips`，不展示邮箱地址。
- 文件归属：仅 I:\\Codex\\dsh-failure-delta\\docs\\COLLABORATION-LOG.md。

## COL-20260919-006 — 修正作者展示方式完成

- 状态：COMPLETED
- 时间（Asia/Shanghai）：2026-09-19T09:07:39+08:00
- 时间（UTC）：2026-09-19T01:07:39Z
- 执行者：Codex/root
- 关联记录：COL-20260919-006 STARTED
- 做了什么：移除协作日志中的具体邮箱地址，作者展示统一保留为 `bluechips`；未改动源码、未重复运行测试、未配置 remote、未执行 push。
- 解决了什么：项目文档不再展示邮箱；说明 Git 提交对象仍受 Git 格式约束而需要邮箱字段。
- 验证命令/退出码：`pwsh -NoProfile -Command "if (rg -n -i '[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}' docs README.md package.json) { exit 1 } else { exit 0 }"` 0；`git status --short --branch` 待提交变更仅为本日志。
- 未解决事项：GitHub remote、目标 branch 和 push 授权仍待确认。
- 下一步：等待用户确认远端目标和 push。

## COL-20260919-003 — 持续实施至 GitHub 推送前

- 状态：STARTED
- 时间（Asia/Shanghai）：2026-09-19T00:28:38+08:00
- 时间（UTC）：2026-09-18T16:28:38Z
- 执行者：Codex/root
- 关联记录：COL-20260919-002
- 工作项：在不执行 GitHub 推送前提下，持续推进 dsh-failure-delta，从 D1 预检进入可实施核心与必要宿主边界，直到达到请求用户确认推送的状态。
- 文件归属：Codex/root 负责 I:\\Codex\\dsh-failure-delta；不修改其他项目、公共 profile 或远端。
- 计划动作：先核对完整冻结文档和官方 pinned 契约；实现可在本项目内安全完成的纯核心与最小宿主骨架；只执行能直接证明契约/回归/打包风险的验证，避免重复或低价值测试。
- 当前待解决问题：项目尚无源码、package、Git 仓库或 D1 运行 probe；官方 Client/Remote/真实 Web/fresh profile/跨平台证据仍未取得。
- 未授权动作：GitHub 推送、npm 发布、公共 profile 安装、权限变更、删除及其他外部状态变更。

## COL-20260919-001 — 建立文档基线

- 状态：STARTED
- 时间（Asia/Shanghai）：2026-09-19T00:13:25+08:00
- 时间（UTC）：2026-09-18T16:13:25Z
- 执行者：Codex/root
- 关联记录：无
- 工作项：为 dsh-failure-delta 建立独立、可交接的 D0 项目文档集。
- 文件归属：Codex/root 负责 I:\Codex\dsh-failure-delta 下所有本次新文档；不改其他项目。
- 做了什么：开始官方在线契约和公开相邻项目预检，读取上一项目的协作/交接规则；创建项目根目录和 docs 目录。
- 解决了什么：固定项目位置和“仅文档、不实现、不安装、不发布”的任务边界。
- 证据：git ls-remote 官方仓库 HEAD 为 ddefc45fbc7f8e46dd73185e68295696d1297887；官方根版本为 0.1.6-alpha.2。
- 剩余事项：补齐需求、架构、解析器、对比算法、数据/UI/隐私、测试、追踪和交接文档；运行文档一致性检查。
- 未执行：源码实现、构建、单元测试、bundle 安装、Web/headless、Git 初始化、提交或远端发布。
- 下一步：以官方公共接口为候选 seam，明确未知/截断/范围变化不得推导“修复”。

## COL-20260919-002 — 文档基线完成

- 状态：COMPLETED（仅 D0 文档工作）
- 时间（Asia/Shanghai）：2026-09-19T00:26:53+08:00
- 时间（UTC）：2026-09-18T16:26:53Z
- 执行者：Codex/root
- 关联记录：COL-20260919-001
- 工作项：独立建立可实施、可验收、可继续交接的 dsh-failure-delta 文档集。
- 文件归属：仅 I:\Codex\dsh-failure-delta 本次新建的 18 份 Markdown；其他项目未修改。
- 做了什么：生成 README、AGENTS、CONTRIBUTING，以及项目、架构、技术、解析器、数据模型、UI、威胁模型、16 个 ADR、测试、追踪、创新性、官方基线、实现交接、验收和协作书；按官方 HEAD 重核契约，不沿用旧版本假设。
- 解决了什么：固定被动错误变化看板定位；将完整可比/有限观察/不可比较、显式通过/诊断消失/未确认、旧报告/路径约束/并发/内存上限/重启清空写成执行规范；提供新对话可复制提示，明确接手者先 D1 而非猜接口。
- 复核修正：统一查询工具候选名 failure_delta_query 与 overlapping-run 原因码；统一状态等级；明确 opt-in 预检允许有界等待且不能遗弃 I/O，默认零额外文件读取；补齐 RPC/摘录预算。
- 官方证据：git ls-remote https://github.com/deepseek-ai/deepseek-harness.git HEAD 得到 ddefc45fbc7f8e46dd73185e68295696d1297887；读取固定 SHA 的官方工具/shell/filesystem/client/remote 文档；根声明 0.1.6-alpha.2、Node ^22.19.0 || >=24.0.0、pnpm@11.7.0。仅源码/文档事实，不是安装兼容证明。
- 文档验证：通过 pwsh 内联只读脚本，以 Get-ChildItem、Get-Content、regex 与 Test-Path 校验文件、链接、围栏、需求与测试引用；退出码 0。结果：18 文件，42 FR/NFR 定义，42 唯一追踪行，72 唯一测试定义，问题 0。
- 引用验证：第二个 pwsh 内联只读脚本检查 G/NG/ADR/T/AC 定义与引用，退出码 0。结果：6 目标、7 非目标、16 ADR、14 威胁、10 验收，未定义引用 0。
- 验证边界：AC-001 仅文档结构 PASS；72 TP 全部为计划/NOT RUN。未把文字或静态检索称为产品可用。
- 未执行：源码、package、依赖安装、typecheck/build/pack、单元/真实 runner/Host/PTC/Web/headless/fresh profile 测试、性能与安全审计、Git 初始化/提交、常用 profile 修改、GitHub/npm 发布。
- 剩余事项：D1 证明真实 cwd/Session/PTC/runner schema、受约束报告读与外部 Client/Remote/导航；精确平台和版本支持尚未授予。检索无法保证市场/GitHub 无相似产品。
- 下一步：用户授权实施后按 IMPLEMENTATION-HANDOFF 的 WP-0 开始；任何范围扩大、安装到环境、权限或发布动作单独确认。
