# Demo Script: Three-Minute Narrated Screen Recording

**Setup before recording:** Open the app at http://localhost:5173. Click "Reset All Data" to ensure a clean start. Have the Import / Demo panel ready.

---

## Minute 0:00–0:20 — Manager workflow introduction

**Action:** Click "Load Demo Data (Both Batches)" on the empty-state screen. Wait for the toast confirmation.

**Narration:** "This is the Revenue Intelligence Inbox for SpendNest. I'll start by loading both data batches — the initial 44 records and the update — to show the post-update state. The app confirms 44 unique records were imported."

**Action:** Navigate to the Dashboard.

**Narration:** "The dashboard shows 44 total records: 30 calls and 14 meetings. Transcript coverage is 18 out of 44 — only records with usable supplied transcript text are counted. I can filter by person or source type. Activity is all on 21 August 2026 in Asia/Kolkata, so the dashboard focuses on person-level breakdowns rather than a date chart."

---

## Minute 0:20–1:00 — Exploring a conversation and routing decision

**Action:** Click "Inbox" in the sidebar. Search for "M07" or scroll to find the Willowfield Trust record. Click it to open the detail view.

**Narration:** "Let me open M07, the Willowfield Trust meeting. This is the record that received a transcript update in the second batch. I can see the full transcript with 27 turns — the customer reported four product issues: a description that won't save, a file upload failure, payments stuck in Processing, and an incorrect amount carrying forward."

**Action:** Scroll to the analysis section. Point to the evidence passages.

**Narration:** "The analysis is rule-based — no AI model is used. Each evidence passage includes the speaker, timecode, and turn number from the transcript. The suggested route is 'Customer support' based on keyword detection of 'issue', 'upload', and 'stuck'. The confidence is medium because we have four clear evidence passages."

**Action:** Scroll to the routing section. Show the suggested route vs manual override.

**Narration:** "This is the difficult routing decision: should M07 also be routed to 'Security / access escalation'? The customer didn't explicitly raise a security concern, but the stuck 'Processing' state could indicate a system-level issue. I'll set a manual route to 'Customer support' — the support issues are the primary signal, and the processing problem is a support investigation, not a security escalation."

**Action:** Select "Customer support" in the dropdown, click "Save manual route." Show the "Manual" badge appears.

---

## Minute 1:00–2:00 — Duplicate import and update test

**Action:** Navigate to "Import / Demo" in the sidebar.

**Narration:** "Now I'll demonstrate the duplicate and update replay. First, let me load the initial batch again."

**Action:** Click "Load Initial Batch." Show the toast: "44 ignored (stale/duplicate)."

**Narration:** "The record count stays at 44 — no duplicates are created because identity is based on the pair (source_type, source_id), not array position or name. The import log shows 44 records were ignored as stale because revision 1 is not newer than the already-applied revision 2."

**Action:** Show the import history table.

**Narration:** "Each import operation is logged with inserted, updated, ignored, and rejected counts."

**Action:** Navigate to Inbox, open M07.

**Narration:** "M07 still shows revision 2 — the stale replay did not overwrite it. The transcript still has 27 turns from the update, and the manual route is still 'Customer support'."

**Action:** Point to the "Manual" badge and the "v2" revision indicator.

---

## Minute 2:00–2:40 — Refresh persistence and exports

**Action:** Refresh the browser (F5 or Ctrl+R).

**Narration:** "After a browser refresh, all data persists via localStorage. The records, applied revisions, review states, and the manual route on M07 are all intact."

**Action:** After refresh, navigate to Inbox, confirm M07 still has the manual route.

**Action:** Navigate to "Export" in the sidebar.

**Narration:** "Let me generate the export archive. The ZIP contains a manifest with all 44 records, their routes, revisions, and review states, plus individual source.json and analysis.json files per record."

**Action:** Click "Export ZIP Archive." Wait for download.

**Narration:** "Every path listed in the manifest points to an actual file in the archive. The manifest identifies source type, source ID, applied revision, routes, manual-override flag, and analysis freshness for each record."

---

## Minute 2:40–3:00 — Summary

**Narration:** "To summarize what we've seen: the app imports 44 unique records, prevents duplicates on repeated import, applies revision updates correctly, preserves manual routing decisions across updates and refreshes, handles missing transcripts honestly with no fabricated analysis, and exports a consistent ZIP archive with a machine-readable manifest. All analysis is deterministic and rule-based — no AI model is used. Thank you."

---

**End of recording.**
