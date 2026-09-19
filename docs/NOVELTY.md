# 创新性、相邻项目与检索边界

查证日期：2026-09-19。结论不是“市场/GitHub 没有相似项目”。已有失败报告、回归分析、失败重跑及验证收据工具；公开检索不足以证明全局不存在。

## 定位比较

| 项目/能力 | 已见定位 | 本项目的差异 |
|---|---|---|
| [stalegreen 作者仓库](https://github.com/pavangupta352/stalegreen) | 核验验证收据及失效/失败/掩盖的绿色完成声明 | 本项目不门禁 done，重点是每轮失败的可见差分 |
| [DSH verification 讨论 #3233](https://github.com/deepseek-ai/deepseek-harness/discussions/3233) | 基于证据的验收/完成门禁方向 | 不制定任务验收条件，仅解释可比检查中的观察变化 |
| [dsh-regression 作者仓库](https://github.com/chenghaoYang/dsh-regression) | 把纠正转为回归案例并分析回归组件 | 不生成案例或做 delta debugging；被动对比现有输出 |
| [Vitest reporters](https://vitest.dev/guide/reporters) | 单次运行结构化/可视化报告 | 在 DSH 会话中连接相邻运行并显式降级证据 |
| [pytest cache](https://docs.pytest.org/en/stable/how-to/cache.html) | 上次失败缓存与重跑 | 不缓存以决定重跑，也不自动执行测试 |

注意：讨论是提案证据，不是已发布产品能力；dsh-regression 仓库本次正文打开失败，定位依据公开作者仓库搜索摘要，未核对实际实现/API，不作强兼容或完整功能判断。

## 值得实施的组合创新

1. 与 DSH 原生调用和会话关联的被动跨运行看板，无额外 LLM 判断或每轮提醒。
2. 将“显式本次通过”“完整检查不再出现”“有限日志未再观察到”作为不同产品状态。
3. 范围缩小、跳过、截断、并发、陈旧报告与环境未知作为一等可见理由，而不是隐藏成绿色变化。
4. 语义多重集合处理重复诊断，行号变化不制造噪声，脱敏与内部身份分离。
5. 内存派生历史、只读授权查询、默认不额外读工作区，使高频观察保持低侵入。

这是产品组合差异，不是每个算法或技术都首创。用户价值应由真实两轮看板、错误分类准确性和交互成本测量证明。

## 本次检索限制

采用官方仓库/讨论、作者仓库及 dsh failure delta、error comparison、verification、regression 等公开查询；没有完整扫描 GitHub、市场插件、闭源产品、其他语言别名或未索引仓库。README、讨论和摘要不等于源码审计。

发布前需重新检索、记录查询词/日期/候选/重叠点，必要时调整公开定位；不能在 npm/GitHub 宣传“唯一”“绝无同类”。本次未申请名称、创建远端仓库或发布。
