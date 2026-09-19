# 解析器与身份规范

## 输入信任级别

规范工具 DTO 可信为宿主执行结果，但其 stdout/stderr、报告 XML/JSON、路径和测试名称仍是攻击者可控输入。先限制字节/深度/条数，再解析，再生成身份，再脱敏展示。绝不 eval、加载项目配置、执行 reporter 插件或解释终端控制序列。

完整输出并不等于完整检查。报告新鲜不等于测试范围一致。解析未匹配不等于通过。

## 命令识别

首版只支持逐个 runner 已验证的简单直接调用与明确包管理器包装，例如固定语法的 tsc、pnpm exec tsc、vitest run、python -m pytest。具体包装/参数支持矩阵由 D1 fixture 固化，未知包装不能猜。

不实现完整 shell AST。遇到管道、&&/分号、多条语句、命令替换、重定向影响报告、变量展开、未知 npm script 或 shell 方言不支持，标 unsupported-command。保留工具调用定位，不保留原始命令。路径处理按已知方言执行；不能用 Unix tokenizer 解析所有 PowerShell。

系列命令语义保留影响范围和执行方式的所有标志；报告输出路径可以在已验证专用参数位置排除，但不能笼统删除所有路径/数字。cwd 必须为实际执行坐标；仅 session.header.cwd 候选不足。

## tsc-diagnostics-v1

- 支持已验版本的非 pretty 形式：file(line,column): error TSnnnn: message，以及全局 error TSnnnn: message。
- 合并经过 fixture 验证的续行；ANSI 先按有限状态清理，不删除语义正文。
- Windows 盘符、括号文件名、Unicode、CRLF、全局诊断须有 fixture。正则不能把盘符冒号或正文坐标误作分隔。
- tsc --build / 增量缓存、监视模式、复合脚本默认降级；不能用一次空日志证明完整重检。
- 诊断全量资格需确定运行模式、完整捕获、退出结果及未遗漏的支持格式。未知片段存在时 parserComplete=false。

身份：runner + workspaceRelativeFile（或显式 global）+ TS code + 保守规范化全文语义。仅统一换行/确定的格式边界；不任意删变量值、数字、引用类型。行列不入身份。同身份多次出现保留次数。

## vitest-json-v1

以支持窗口内的官方 JSON reporter schema 为准，不能将“Jest compatible”当成所有版本相同。优先新鲜独占报告；stdout JSON 只有整个受限输入恰好一个 JSON 文档且没有混杂输出才有资格。

解析 testResults 与 assertionResults：文件/项目、ancestorTitles、title/fullName、status、failureMessages。顶层 totals 与实际 inventory 自洽；字段类型/状态枚举未知则降级。忽略且不存 coverage、源码或非必要扩展字段。success:true 不能替代每个基线失败 case 的当前 passed。

用例身份：runner + project + workspaceRelativeFile + exact name chain（含参数化后缀）。不能仅用 fullName；重复同身份但无法唯一映射时 ambiguous。watch、--changed、--related、过滤、shard、retry、bail、pending、todo 都影响范围/清单资格。终端 dot 或 summary 默认只作计数观察，不能补造 passed case。

## pytest-junit-v1 / pytest-text-v1

文本解析只提供有限观察，例如受支持短摘要和明确节点失败；彩色进度、插件输出及被截断 traceback 不能证明完整清单。

JUnit XML 禁止 DTD、外部实体、网络解析、实体膨胀；深度、节点、字节有界。解析 testsuite/testcase 与 failure/error/skipped，参数化名称保留。classname/name 不总是唯一或代表完整 collection；缺 file、同名冲突、计数不符或过滤范围未知时降级。empty testcase 无失败字段只有在支持 schema 和明确执行记录下才可视为该 case passed，不代表项目全通过。

--lf、-k、路径选择、deselect、--maxfail、xdist、插件差异、collection errors 必须显式处理。JUnit 不一定携带所有 collection/环境信息；profile 声明不能直接将其升级为完整可比。

## 通用构建日志

只给 opaque-run 与退出结果，或提取已确认嵌套解析器的有限诊断。不承诺支持任意 webpack/vite/maven/自定义构建。多个 runner 混杂且缺明确分段时不可比较。未知 parser 需要独立评审/fixtures，不能添加兜底正则后声称完整支持。

## 指纹与脱敏顺序

内部语义采用进程随机密钥 HMAC-SHA-256，键域包含诊断/用例种类和解析器版本；不向客户端提供原始语义。密钥仅内存，epoch 变化后旧身份不可复用。先对受限语义生成身份，再脱敏摘录，避免两个不同密钥被同一 [REDACTED] 摘录误合并。

显示去除 ANSI/OSC/控制字符，遮盖凭据、URL userinfo/query 常见密钥、绝对外部路径和敏感配置值，限制长度。脱敏不是完整秘密检测保证；默认不保留原日志、不导出全文、不上传可降低剩余风险。

## 差异规则

诊断计数 a→b：persisting=min(a,b)，new=max(0,b-a)，missing=max(0,a-b)。missing 在有限观察只能称“未再观察到”；完整可比才能称“本次检查不再出现”。

基线失败用例到当前：passed→passed-now；failed/error→persisting；skipped/pending/todo/deselected/absent/ambiguous→unconfirmed。新增失败为 new-failure。缺失与跳过不得从失败分母中静默移除。

不可比较时仅显示两端原观测与 reasonCodes，不计算改善计数。first-failure 只是排序/定位信息，不称根因。分类过程必须确定性，可由 fixture 重放。
