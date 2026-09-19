# 项目章程

## 1. 产品问题

开发 Agent 反复运行测试/构建时，用户很难从一连串长日志判断：上次的失败是否还在、出现了什么新失败、只是没再执行那项测试，还是本次确实通过。简单错误摘要与“exit 0”不足以回答这些问题。

`dsh-failure-delta` 要提供跨运行、带证据等级的错误变化看板，而不是新的自动修复器或任务完成门禁。

## 2. 目标

| 目标 ID | 目标 |
| --- | --- |
| G-001 | 支持的开发检查结束后自动生成可见运行卡和差分。 |
| G-002 | 任何截断、范围缩小、跳过、取消和身份歧义不产生假“已解决”。 |
| G-003 | 默认不改变原工具执行/结果/权限，不增加模型上下文噪声。 |
| G-004 | 通过原调用定位和脱敏摘录，让用户快速找到新增及持续失败。 |
| G-005 | Windows/bash 路径、并发、资源和隐私有独立证据。 |
| G-006 | 文档、需求、测试和协作记录可以独立交给他人实施。 |

## 3. v1 范围

- DSH 原生 bash/pwsh foreground canonical result 的 passive observer。
- TypeScript 非 pretty tsc 诊断、Vitest JSON/有限终端结果、pytest 有限终端结果及 opt-in JUnit artifact。
- 精确 runner schema 支持窗口在 D1 锁定，其他版本降级。
- 同一 session 下按 workspace/cwd/命令/runner/scope/profile 分组。
- 自动选择无并发歧义的前一运行；可手选历史基线但使用相同门禁。
- Web session 看板 + read-only 按需查询工具。
- 内存派生历史，Host 重启后清空。

## 4. 非目标

| ID | 非目标 |
| --- | --- |
| NG-001 | 自动修复代码、重试命令、选择性重跑、生成测试。 |
| NG-002 | 阻断 Agent 的 done 或审查最终自然语言声明。 |
| NG-003 | 推断错误根因、证明修改因果、证明项目整体可用。 |
| NG-004 | 自动覆盖背景 job、MCP、IDE、用户终端及自定义 shell 工具。 |
| NG-005 | 持久化/恢复派生历史，修复 DSH 会话，跨 session 自动比较。 |
| NG-006 | 保存完整日志、自动读 spillPath、收集环境变量/凭据。 |
| NG-007 | 无条件支持所有测试框架、语言、shell 脚本。 |

## 5. 证据等级

| 等级 | 意义 | 允许显示 |
| --- | --- | --- |
| `complete-comparable` | 已列出的必要元数据一致，scope 已知，输入/报告完整、可识别 | 新增/持续；测试明确 failed→passed；编译诊断不再出现 |
| `observational` | 同组但部分元数据/范围/日志/报告未知 | 观察到的新增/持续/未再观察到，必须带有限观察标签 |
| `incomparable` | cwd、命令语义、runner、scope/config 或 parser 窗口不兼容 | 并排运行事实及不可比原因，不显示改善百分比 |

complete-comparable 不是对整个运行环境、供应商或任意恶意工具的安全证明。未知 runtime/env 必须降至 observational；用户声明不能升级为实际观测证据。

## 6. 典型用户场景

1. 修复 tsc 错误：看 15 个诊断中哪几个不再出现，重复同类诊断是否只少了一部分。
2. 修复 Vitest/pytest：看先前失败测试是否明确 passed；skip、消失、deselected 单列。
3. 构建日志变短：显示当前命令完成情况和已识别诊断，不把“没有匹配到错误”当成构建成功。
4. 多 Agent 并发：每个 session 隔离，重叠运行标记 concurrent，不用完成时间反推代码因果。

## 7. 交付阶段

当前进度：D1 SOURCE 已通过固定 SHA 只读 probe；D2 核心局部达到 `CORE_TESTED`。真实宿主、Web、fresh profile 和发布仍按独立证据门槛推进。

| 阶段 | 交付物 | 出口 |
| --- | --- | --- |
| D0 | 本文档集 | 链接、围栏、42 需求和测试追踪校验 |
| D1 | 官方 seam + runner probe | 工作目录、结果、scope、Client/remote 能力明确；无停止条件 |
| D2 | 纯解析/比较/有界 store | 单元、属性、模糊测试通过 |
| D3 | Host collector、query、Client panel | 真实 runtime/PTC、会话隔离和无副作用验证 |
| D4 | fresh profile、Web/headless、包 | 可见性、安装/卸载、隐私与资源验收 |
| D5 | 发布 | 用户单独授权，重新检索相邻项目 |

## 8. 成功指标

- 高支持质量 fixture 中所有转换判定与 oracle 一致。
- 截断/skip/范围缩小/异常 fixture 的 false-resolved 为 0。
- 两次支持运行后，Web 中真实出现新增、持续、明确通过或未再观察到列表。
- collector 打开/关闭时，原工具 value/content/exitCode 和执行次数不变。
- 核心不调用 LLM、网络或执行 runner。
- 资源超限有可见 dropped/partial，不显示空列表绿色成功。

“节省多少 token/时间”必须用 benchmark/用户试验测量，D0 不写虚构百分比。
