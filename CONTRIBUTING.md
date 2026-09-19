# 贡献指南

## 变更流程

1. 完整阅读 AGENTS 和相关设计；协作书写 STARTED。
2. 明确工作包与文件归属，完成官方 D1 preflight。
3. 建立 FR → parser rule/ADR → TP → 验收映射。
4. 先写合成 positive/negative fixture，再做最小实现。
5. 对比原工具行为，证明 recorder 无副作用。
6. 更新文档和协作书终态，提交实际命令、退出码和剩余问题。

## Parser 贡献

每个版本窗口必须提供：官方 schema/CLI 来源、精确 runner 版本、Linux/Windows 样本、完整/截断/失败/成功/跳过/收集错误样本，以及不支持格式的降级测试。真实样本只能经授权和脱敏，默认用合成 fixture。

不允许仅增加一条 regex 就声明“支持所有版本”。新增 parser 不能扩大 accepted command grammar。

## Comparator 贡献

所有新增匹配规则需检验误合并与误拆分。模糊匹配、忽略数字、删除测试参数后缀、跨文件配对等规则均需 ADR；v1 默认精确语义指纹及 multiset，不自动模糊合并。

## UI 贡献

字符串作为纯文本渲染；颜色之外必须有文字/图标；unknown/partial 不得显示绿色成功。浏览器没有读取本机文件或执行命令的直接权限。RPC 以 Host 已解析 session 为界，不信任任意 sessionId 字符串。

## 交付/PR 必需信息

- FR/TP/ADR 编号；DSH 与 runner 版本；
- 调整的能力边界和隐私面；
- 原工具 value/content/退出语义对照；
- 单元、属性、真实 runtime、Web、headless、fresh profile 安装/卸载证据；
- 未完成项与状态级别。

建议提交格式：`type(scope): summary`。不得提交 raw logs、报告中的源代码片段、凭据、node_modules 或含绝对私人路径的测试样本。当前文档阶段没有代码提交/发布授权。
