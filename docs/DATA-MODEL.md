# 数据模型与生命周期

以下 TypeScript 是跨模块契约草案，非已导出的上游类型。宿主 canonical DTO 先做运行时形状校验，再转入本模型。

```ts
type Grade = 'complete-comparable' | 'observational' | 'incomparable';
type Evidence = 'known' | 'unknown' | 'incomplete' | 'unsupported';
type RunState = 'processing' | 'ready' | 'unsupported' | 'dropped' | 'error';
type TestStatus = 'passed' | 'failed' | 'error' | 'skipped' | 'pending'
  | 'todo' | 'deselected' | 'ambiguous';
interface Completeness {
  capture: Evidence; parser: Evidence; inventory: Evidence;
  metadata: Evidence; freshness: Evidence;
  reasons: string[];
}
interface Diagnostic {
  id: string; // HMAC domain identity, never raw message
  code?: string; file?: string; line?: number; column?: number;
  excerpt: string; occurrences: number;
}
interface TestCase {
  id: string; displayName: string; file?: string; project?: string;
  status: TestStatus; excerpt?: string;
}
interface Run {
  runId: string; epoch: string; startSeq: number;
  startedAt: string; observedEndAt: string; // host observation, not process clock
  callId: string; rootCallId: string;
  state: RunState; runner: string; parserVersion: string;
  basicSeriesKey: string;
  comparisonEvidenceKey?: string; // exists only if necessary metadata known
  completeness: Completeness;
  process?: { exitCode: number | null; signal: string | null;
    timedOut: boolean; aborted: boolean };
  toolFailureCode?: string;
  sourceRevisionNote?: string; // optional fact, never causal certificate
  diagnostics: Diagnostic[]; tests: TestCase[];
  droppedDiagnostics: number; droppedTests: number;
  reasons: string[];
}
interface Delta {
  baselineRunId: string; currentRunId: string; grade: Grade;
  reasons: string[];
  diagnostics?: { new: number; persisting: number;
    notObserved: number; absenceLabel: 'not-observed' | 'not-reproduced' };
  tests?: { newFailures: number; persistingFailures: number;
    passedNow: number; unconfirmed: number };
}
interface Snapshot {
  epoch: string; revision: number; runs: Run[];
  health: { droppedRuns: number; evictedRuns: number;
    recorderErrors: number; queueBytes: number; storeBytes: number };
  nextCursor?: string;
}
```

## 内部/远端分离

内部 PendingExecution 另含执行 token、可信 Session 对象、agent 对象、执行坐标与报告证据，不导出到 DTO。Remote 输出不含宿主 Session 原始对象、原始命令、密钥、原始报告路径或 HMAC 密钥。工具调用 ID 仅在授权会话范围用于官方定位。所有 displayName/file/project/excerpt 同样须脱敏并限制长度，不能因来自报告字段就直接暴露。

basicSeriesKey 不足以授予完整可比。comparisonEvidenceKey 同时覆盖目录/命令语义/范围/配置/runner/schema/运行时/环境的已知证据；缺任何必要项即不存在。元数据哈希不是源代码哈希：源码变化正常，配置变化另列比较原因。

## 状态序列

```text
execute(startSeq) → pending → result → bounded queue → processing → ready
                               ├→ unsupported (background/unknown DTO)
                               └→ dropped/error (budget/recorder failure)
host restart → new epoch → empty snapshot + visible restart notice
```

startedAt、observedEndAt 都来自宿主观察；不冒充底层进程精准时间。无可信 start 捕获的运行有内部序列兜底但不得作为完整可比基线，UI 理由 start-evidence-missing。

运行进入 ready 后派生内容不可变；元数据修正必须创建明确新 revision，不能悄悄更改历史结论。基线必须在当前开始前已经 ready。重叠运行可显示事实，但不能建立完成前后因果结论。

## 清理和一致性

每 Session 有独立有界 store，所有 Session 共用全局预算。淘汰不影响原工具，UI 显示累计 evictedRuns；引用已淘汰 run 的对比返回 expired-run，不改用别的基线冒充。队列丢失保留轻量 tombstone 与健康计数；tombstone 本身也有全局预算，过限只留聚合计数。

revision 单调递增，只表示该 epoch 状态版本；客户端重连必须先全量授权刷新。旧 epoch/游标不能与新状态拼接。浏览器刷新可从仍存活的宿主重取；宿主重启不恢复历史。v1 不创建 sidecar、SQLite、IndexedDB 或永久日志。

## 比较原因代码

至少包含 capture-truncated、parser-unsupported、inventory-incomplete、metadata-unknown、cwd-unknown、scope-changed、config-changed、runner-changed、schema-changed、environment-changed、report-not-fresh、report-path-untrusted、overlapping-run、start-evidence-missing、budget-exceeded、ambiguous-test、baseline-missing、expired-run、epoch-changed。

代码为稳定 API，中文文案映射在 UI；用户文本不能直接充当错误码。API 错误区分 invalid-argument、forbidden-or-not-found、expired、unsupported，不能通过存在性错误泄露别的会话数据。
