# Revenue Intelligence Inbox

A manager workspace that turns incoming calls, meetings, transcripts, and notes into an understandable, auditable queue of decisions and next actions for SpendNest.

## Prerequisites

- Node.js 18+ (tested with Node 20)
- npm 9+

## Installation

```bash
cd app
npm install
```

## Startup (development)

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Production build

```bash
npm run build
npm run preview    # serves the built files locally
```

The build output goes to `dist/`. The build succeeds with no warnings.

## Import instructions

### Demo load (recommended for reviewers)

1. Open the app. If no data is loaded, click **"Load Demo Data (Both Batches)"** on the empty-state screen.
2. Or navigate to **Import / Demo** in the sidebar and use the demo controls:
   - **Load Initial Batch** — imports 01_initial.json (44 records, 17 transcripts)
   - **Apply Update Batch** — imports 02_update.json (updates M07, adds 18th transcript)
   - **Load Both (Demo State)** — loads both batches in sequence

### File import

1. Go to **Import / Demo** in the sidebar.
2. Click **"Choose JSON file to import"** and select `01_initial.json` or `02_update.json` from the project root.
3. The import summary appears as a toast notification and in the import history table.

### Replay steps (reproducing the test sequence)

1. Click **Load Initial Batch** — 44 unique records appear (30 calls, 14 meetings), 17 with transcripts.
2. Click **Load Initial Batch** again — count stays at 44, no duplicates created.
3. Go to **Inbox**, open **M07** (Willowfield Trust / SpendNest), change its route manually (e.g., to "Customer support") and click **Save manual route**.
4. Return to **Import / Demo** and click **Apply Update Batch** — M07 gets the updated transcript (18th transcript becomes available), manual route survives.
5. Click **Load Initial Batch** again — M07's newer revision (v2) is not overwritten by the older revision (v1).
6. Refresh the browser — all records, manual routes, and review states persist via localStorage.

### Reset

Go to **Import / Demo** and click **Reset All Data**. This clears localStorage and removes all records. A confirmation dialog prevents accidental data loss.

## Export instructions

Go to **Export** in the sidebar:

- **Export JSON** — downloads `revenue-inbox-export.json` with all records and application state.
- **Export CSV** — downloads `revenue-inbox-export.csv` suitable for spreadsheet applications.
- **Export ZIP Archive** — downloads `revenue-inbox-export.zip` containing:
  - `exports/manifest.json` — machine-readable manifest with source_type, source_id, revision, routes, output paths, review state, manual-override flag, and analysis freshness.
  - `exports/records/<source_type>_<source_id>/source.json` — raw source payload per record.
  - `exports/records/<source_type>_<source_id>/analysis.json` — analysis output per record.
  - `exports/README.md` — explains the output structure.

## Metric definitions

| Metric | Numerator | Denominator | Notes |
| --- | --- | --- | --- |
| Total records | Distinct (source_type, source_id) pairs | — | Repeated imports do not increase this count |
| Calls | Records where source_type = "call" | — | |
| Meetings | Records where source_type = "meeting" | — | |
| Transcript coverage | Records with usable supplied text (non-blank call transcript or at least one non-blank meeting turn) | All unique source records in the current filter | 17 initially, 18 after update |
| Review: Pending | Records with reviewState = "pending" | — | No human action taken |
| Review: Reviewed | Records with reviewState = "reviewed" | — | Manager set a manual route or marked reviewed |
| Review: Attention | Records with reviewState = "attention" | — | Flagged for special attention |
| Route counts | Records assigned each route | — | A record can have multiple routes; sum may exceed total records |
| Activity by person | Records grouped by person | — | Calls: rep_name. Meetings: organizer_email. Organiser is not automatically a salesperson or attendee. All activity is on 21 August 2026 (Asia/Kolkata). |

Click the "Metric definitions" button on the Dashboard for an in-app explanation panel.

## Routing taxonomy

| Route ID | Label | Description |
| --- | --- | --- |
| sales_follow_up | Sales follow-up | Prospect/customer showed interest; send materials, schedule demo, or follow up on pricing |
| customer_support | Customer support | Existing customer reporting product issues, bugs, or workflow problems |
| security_escalation | Security / access escalation | Access control, permission, or security concerns needing escalation |
| partnership | Partnership follow-up | Potential partner/supplier discussion about integration or referral |
| sales_coaching | Sales coaching | Call transcript reveals a coaching opportunity for the rep |
| internal_ops | Internal / vendor ops | Internal training, billing operations, or vendor operational discussion |
| human_review | Human review needed | No usable transcript text; needs human intake review |

A record can have multiple routes. The manager can override the suggested route with a manual decision that survives source updates.

## Analysis method

**All analysis is rule-based and deterministic.** No AI model or LLM is used at runtime.

- **Routing rules**: keyword and pattern matching on transcript text and metadata fields (e.g., "proposal" → sales_follow_up, "issue" + "upload" → customer_support, "permission" + "access" → security_escalation).
- **Summary generation**: template-based summaries built from detected patterns in each individual transcript. No generic summary is used for all conversations.
- **Evidence extraction**: key turns/phrases matching signal patterns are extracted with speaker, timecode, and turn number.
- **Confidence assessment**: based on the number of evidence passages found.
- **Manager brief**: pre-generated based on reading all 18 transcripts after applying the update batch. It is static and does not react to dashboard filters.

When source text changes (e.g., M07 update), the analysis freshness is marked as "pending_review" to signal that the analysis should be re-examined. The manager can mark it as current after reviewing.

## Manual overrides

- A manual route override is stored separately from the suggested route.
- Source updates never erase a manual override.
- The manual override is clearly labeled with a "Manual" badge.
- The manager can reset the manual override to return to the suggested route.
- Manual overrides persist across browser refreshes via localStorage.

## Analysis freshness

| State | Meaning |
| --- | --- |
| Current | Analysis reflects the current source revision |
| Pending review | Source text changed; analysis should be re-examined |
| Stale | Analysis is based on an older revision |

## Known limitations

1. **Single-day sample**: All activity falls on 21 August 2026. A date chart alone provides limited insight; the dashboard focuses on person-level and route-level breakdowns instead.
2. **No verified CRM data**: No authoritative opportunity value, deal stage, or account relationship is supplied. The app does not invent these.
3. **No cross-meeting speaker identity**: Meeting speaker labels (e.g., "Team member A") are local to each meeting, not cross-meeting identities.
4. **Deterministic analysis only**: The routing and summary rules are keyword-based and may miss nuanced patterns a human would catch. This is disclosed honestly.
5. **localStorage persistence**: State is stored in browser localStorage. Clearing browser data will reset the app.
6. **No audio/video**: No playable media is supplied. Transcripts are the only conversational evidence.
7. **ZIP export uses JSZip**: The dynamic import means the first ZIP download may take a moment to load the library.

## Tests

```bash
npm test
```

22 automated tests covering: initial import (44 records), duplicate import (no inflation), order-independent identity, manual override, update application, manual decision preservation, stale replay, refresh persistence, missing transcript handling, JSON/CSV/ZIP exports, manifest consistency, and error handling. All tests pass.

See the manual QA checklist below for additional verification steps.

## Manual QA checklist

- [ ] Load initial batch: 44 records appear (30 calls, 14 meetings)
- [ ] Load initial batch again: count stays 44, import log shows 44 ignored
- [ ] Open M07 in inbox: transcript shows "unavailable" with reason
- [ ] Set M07 manual route to "Customer support": badge shows "Manual"
- [ ] Apply update batch: M07 now has 27 turns of transcript, manual route still active
- [ ] Load initial batch again: M07 still at revision 2, manual route preserved
- [ ] Refresh browser: all data persists
- [ ] Export JSON: file downloads, opens in browser, shows 44 records
- [ ] Export CSV: file downloads, opens in spreadsheet, has 45 rows (header + 44)
- [ ] Export ZIP: archive extracts, manifest.json lists 44 records with valid paths
- [ ] Import malformed JSON: error message shows, existing data unchanged
- [ ] Dashboard filters by person and source type work correctly
- [ ] Manager brief links to source records

## Approximate work time

Approximately 7-8 hours: data inspection (1h), core engine and import logic (2h), UI components (2h), routing and analysis rules (1h), exports (0.5h), tests and build verification (0.5h), documentation (1h).

## How the reviewer can open and test the app

1. `cd app && npm install && npm run dev`
2. Open http://localhost:5173
3. Click "Load Demo Data (Both Batches)" on the welcome screen
4. Explore the Dashboard, Inbox, Manager Brief, and Export panels
5. Follow the replay steps above to test duplicate/update behavior
6. Use `npm run build` to verify production build succeeds
7. Use `npm test` to run the automated test suite
