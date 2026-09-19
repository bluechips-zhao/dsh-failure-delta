# 需求追踪矩阵

每项均为 PLANNED。32 条功能需求 + 10 条非功能需求全部连接到实现责任、测试与验收。编号定义以 [TECHNICAL-SPEC](TECHNICAL-SPEC.md) 为准，测试以 [TEST-PLAN](TEST-PLAN.md) 为准。

| 需求 | 实现责任 | 测试 | 验收 |
|---|---|---|---|
| FR-001 | collector/advisory boundary | TP-001、TP-003、TP-055 | AC-003 |
| FR-002 | native adapter | TP-001、TP-002、TP-008 | AC-003 |
| FR-003 | execute wrapper | TP-003、TP-048 | AC-003 |
| FR-004 | canonical decoder | TP-004、TP-008 | AC-003 |
| FR-005 | identity/session capture | TP-005、TP-006、TP-007、TP-069 | AC-003 |
| FR-006 | command/scope recognizer | TP-009、TP-010、TP-011、TP-012、TP-013 | AC-004 |
| FR-007 | parser registry | TP-014、TP-070 | AC-004 |
| FR-008 | tsc parser | TP-015、TP-019、TP-020 | AC-004 |
| FR-009 | Vitest parser | TP-016、TP-024、TP-025 | AC-004 |
| FR-010 | pytest parser | TP-017、TP-026、TP-027、TP-028 | AC-004 |
| FR-011 | completeness reducer | TP-029、TP-031、TP-032、TP-045 | AC-005 |
| FR-012 | comparison eligibility | TP-031、TP-032、TP-033、TP-042 | AC-005 |
| FR-013 | baseline selection | TP-035、TP-036、TP-038 | AC-005 |
| FR-014 | fingerprint | TP-021、TP-022、TP-025、TP-050 | AC-005 |
| FR-015 | multiset/test conflict | TP-023、TP-025、TP-041 | AC-005 |
| FR-016 | test transitions | TP-039、TP-040 | AC-005 |
| FR-017 | delta categories | TP-041、TP-042 | AC-005 |
| FR-018 | wording/data contract | TP-034、TP-044、TP-059 | AC-005 |
| FR-019 | process outcome | TP-018、TP-043、TP-048 | AC-005 |
| FR-020 | metadata profile | TP-012、TP-032、TP-033、TP-034、TP-054 | AC-005 |
| FR-021 | Web panel | TP-059、TP-066、TP-067 | AC-008 |
| FR-022 | call locator | TP-060 | AC-008 |
| FR-023 | query tool | TP-061、TP-068 | AC-008 |
| FR-024 | bounded store/health | TP-045、TP-046、TP-047、TP-056 | AC-007 |
| FR-025 | privacy pipeline | TP-049、TP-050、TP-063、TP-072 | AC-006 |
| FR-026 | artifact reader | TP-028、TP-051、TP-052、TP-053、TP-054、TP-070 | AC-006 |
| FR-027 | epoch lifecycle | TP-047、TP-058 | AC-007 |
| FR-028 | concurrency/drop handling | TP-035、TP-036、TP-046、TP-048 | AC-007 |
| FR-029 | authorized query/remote | TP-007、TP-057、TP-058 | AC-006 |
| FR-030 | packaging/profile | TP-065、TP-066、TP-072 | AC-009 |
| FR-031 | manual baseline | TP-037、TP-038 | AC-005 |
| FR-032 | advisory UI | TP-044、TP-059、TP-062、TP-071 | AC-008 |
| NFR-001 | platform evidence | TP-002、TP-067、TP-068 | AC-009 |
| NFR-002 | side-effect audit | TP-071、TP-072 | AC-006 |
| NFR-003 | resource benchmark | TP-045、TP-046、TP-047、TP-056 | AC-007 |
| NFR-004 | context budget | TP-061、TP-071 | AC-007 |
| NFR-005 | file access boundary | TP-051、TP-052、TP-053、TP-054、TP-071 | AC-006 |
| NFR-006 | core isolation | TP-030、TP-041 | AC-004 |
| NFR-007 | compatibility matrix | TP-014、TP-065、TP-069、TP-070 | AC-002 |
| NFR-008 | accessibility | TP-064 | AC-008 |
| NFR-009 | failure isolation | TP-003、TP-048、TP-055 | AC-003 |
| NFR-010 | packed audit | TP-072 | AC-009 |

## 目标与设计对应

| 项目目标 | 关键设计 | 验收 |
|---|---|---|
| G-001 | ADR-002、ADR-007、ADR-013 | AC-003、AC-008 |
| G-002 | ADR-003、ADR-005、ADR-006、ADR-008 | AC-004、AC-005 |
| G-003 | ADR-001、ADR-004 | AC-003、AC-007 |
| G-004 | ADR-007、ADR-012 | AC-006、AC-008 |
| G-005 | ADR-009、ADR-010、ADR-011、ADR-014 | AC-006、AC-007、AC-009 |
| G-006 | ADR-015、ADR-016 | AC-001、AC-010 |

风险 T-001–T-014 在 THREAT-MODEL 中定义；相应防护落在上述需求和测试。增加 requirement 必须同步增加追踪行、测试 oracle 和验收归属，不得仅写到 README。
