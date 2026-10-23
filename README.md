# Revenue Intelligence Inbox

A manager workspace that turns incoming calls, meetings, and transcripts into an auditable queue of decisions and next actions — built for the SpendNest hiring assignment.

> **Live Demo →** [revenue-intelligenceinbox.vercel.app](https://revenue-intelligenceinbox.vercel.app) *(update this link after deployment)*

---

## What it does

Sales managers receive calls and meeting records from multiple systems. Transcripts arrive late, labels don't always match what was said, and decisions get lost. This app solves that by:

- Showing all 44 source records (30 calls + 14 meetings) in one searchable inbox
- Routing each conversation to the right category using deterministic rules
- Letting a manager override any route manually — overrides survive source updates
- Handling late transcript delivery (M07 arrives in a second batch with no data loss)
- Exporting a ZIP archive with a machine-readable manifest for every record

---

## Tech stack

| | |
|---|---|
| Framework | React 18 + Vite |
| Language | JavaScript (ES modules) |
| Styling | Plain CSS |
| Icons | Lucide React |
| Export | JSZip |
| Tests | Vitest + Testing Library |
| Persistence | Browser localStorage |
| Deployment | Vercel |

No backend. No API keys. No paid services. Runs entirely in the browser.

---

## Screens

| Screen | What it shows |
|---|---|
| **Dashboard** | Total records, transcript coverage, review states, route counts, activity by person with filters |
| **Inbox** | Searchable table of all 44 records with type, transcript status, route badges, review state |
| **Detail view** | Full transcript, evidence passages with speaker/timecode, analysis, manual route override |
| **Manager Brief** | Pre-generated summary for 21 Aug 2026 with evidence quotes linked to source records |
| **Import / Demo** | Demo load buttons, file picker, import history log, replay guide |
| **Export** | JSON, CSV, and ZIP archive with manifest |

---

## Getting started

### Prerequisites

- Node.js 18+
- npm 9+

### Install and run

```bash
git clone https://github.com/Ahamed-ammar/revenue_Intelligence_inbox.git
cd revenue_Intelligence_inbox/app
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### Load the data

On the welcome screen click **"Load Demo Data (Both Batches)"** — this imports all 44 records plus the M07 transcript update in one click.

### Production build

```bash
npm run build    # outputs to dist/
npm run preview  # serve the built files locally
```

### Run tests

```bash
npm test
```

22 automated tests, all passing.

---

## Replay test sequence

| Step | Action | Expected result |
|---|---|---|
| 1 | Load Initial Batch | 44 unique records, 17 transcripts |
| 2 | Load Initial Batch again | Count stays 44, no duplicates |
| 3 | Open M07 → set manual route | Route saved with "Manual" badge |
| 4 | Apply Update Batch | M07 gets 27-turn transcript, manual route intact |
| 5 | Load Initial Batch again | M07 stays at revision 2, not overwritten |
| 6 | Refresh the browser | All records, routes, and review states persist |

---

## Routing taxonomy

| Route | When it applies |
|---|---|
| Sales follow-up | Prospect showed interest; send materials or schedule next step |
| Customer support | Existing customer reporting product bugs or workflow issues |
| Security / access | Permission concerns, login problems, access escalation |
| Partnership | Supplier/partner integration or referral discussion |
| Sales coaching | Rep coaching opportunity identified in transcript |
| Internal / vendor ops | Internal training, billing operations, vendor discussion |
| Human review | No usable transcript — intake tracking only |

A record can have multiple routes.

---

## Analysis method

All analysis is **rule-based and deterministic**. No AI model or LLM is called at runtime.

- **Routing** — keyword and pattern matching on transcript text and metadata
- **Summaries** — per-record template built from detected patterns
- **Evidence** — key transcript turns extracted with speaker, timecode, and turn number
- **Manager brief** — pre-generated after reading all 18 transcripts; static, not filter-reactive

---

## Export structure

```
exports/
├── manifest.json
├── README.md
└── records/
    ├── call_<source_id>/
    │   ├── source.json
    │   └── analysis.json
    └── meeting_<source_id>/
        ├── source.json
        └── analysis.json
```

---

## Project structure

```
revenue_Intelligence_inbox/
├── app/                     ← React/Vite application (deploy root)
│   ├── src/
│   │   ├── components/      React UI components
│   │   ├── lib/             Core logic (import engine, routing, exports)
│   │   ├── data/            Bundled JSON source files
│   │   ├── styles/          CSS
│   │   └── tests/           Vitest test suite (22 tests)
│   ├── docs/
│   │   ├── findings.md
│   │   ├── rejected-decision.md
│   │   ├── demo-script.md
│   │   └── slide-outline.md
│   ├── vercel.json
│   └── package.json
├── 01_initial.json          ← Source data (initial batch)
├── 02_update.json           ← Source data (update batch)
├── ASSIGNMENT.md
├── DATA_DICTIONARY.md
└── DATA_CONTRACT.md
```

---

## Known limitations

1. Single-day sample (21 Aug 2026) — date charts not meaningful
2. No CRM opportunity values — none supplied, none invented
3. No cross-meeting speaker identity
4. Keyword-based routing may miss nuanced patterns
5. localStorage is browser-specific — clearing browser data resets the app

---

## License

Built for the SpendNest Revenue Intelligence hiring assignment. Data is de-identified and adapted for assessment purposes.
