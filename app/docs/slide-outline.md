# Five-Slide Presentation Outline

Transfer this outline to your preferred presentation tool (Google Slides, PowerPoint, Keynote).

---

## Slide 1: Manager Problem and Main Findings

**Title:** Revenue Intelligence Inbox — Turning Conversations into Decisions

**Content:**
- **Problem:** A sales manager receives 44 calls and meetings from multiple systems. Transcripts arrive late, labels disagree with what people said, and stored summaries are withheld. The manager needs to know what needs attention and why.
- **Three findings from the data:**
  1. **Willowfield Trust (M07)** reported 4 product bugs in one session — including payments stuck in "Processing" affecting multiple users (Turn 19).
  2. **Asterloom Systems (M03)** prospect was quoted two different prices (INR 26K vs INR 39K), creating a trust gap before CFO approval (Turn 23–24).
  3. **Cold call (C01)** to Harborlight Advisory prospect triggered hostile reaction — list-source transparency and objection handling are coaching opportunities.
- **Key constraint:** Only 18 of 44 records have usable transcript text. The other 26 are tracked for intake with no fabricated analysis.

---

## Slide 2: Interface Choices and Deliberately Omitted Features

**Title:** What I Built and What I Left Out

**What I built:**
- Dashboard with metric definitions, person/type filters, and activity-by-person breakdown
- Searchable inbox with filters for type, transcript availability, route, and sort order
- Detail view with source metadata, full transcript, evidence passages, and routing controls
- Manager brief for 21 August 2026 with links to source records
- Import panel with demo replay controls and import history
- Export panel with JSON, CSV, and ZIP archive + manifest

**What I deliberately omitted:**
- **No charts** — a single-day sample makes date charts misleading. Person-level tables are more useful.
- **No CRM opportunity values** — no deal value data is supplied; inventing it would be dishonest.
- **No LLM/AI model** — routing and summaries are deterministic keyword rules, clearly labeled as such.
- **No cross-meeting speaker matching** — speaker labels are local to each meeting per the data dictionary.
- **No account/company relationship graph** — no verified company-ID join exists in the data.

---

## Slide 3: Routing Design and One Difficult Case

**Title:** Routing Taxonomy and a Difficult Decision

**Routing taxonomy (7 categories):**
| Route | When to use |
|---|---|
| Sales follow-up | Prospect showed interest, materials requested |
| Customer support | Product bugs, workflow issues |
| Security / access | Permission concerns, login problems |
| Partnership | Supplier integration, referral arrangement |
| Sales coaching | Rep improvement opportunity |
| Internal / vendor ops | Training, billing operations |
| Human review | No usable transcript text |

**Multi-route:** A record can have multiple routes. Route counts may exceed record count.

**Difficult case — M09 (Account setup):**
- Customer reports expired login token (security/access escalation)
- Raises shared mailbox permission concerns (security)
- Needs workflow training (internal ops)
- **Decision:** Suggested routes include both `security_escalation` and `customer_support`. The manager can narrow it with a manual override if the primary concern is the access issue.

**Rejected alternative:** Single-route-per-record. Rejected because it would lose real information from multi-purpose conversations. (See `docs/rejected-decision.md`)

---

## Slide 4: How I Checked a Key Number and a Key Analytical Conclusion

**Title:** Verification: Transcript Coverage and M07 Routing

**Key metric — Transcript coverage: 18/44 (41%)**
- **Numerator:** Records with usable supplied text (non-blank call transcript or at least one non-blank meeting turn) = 10 calls + 8 meetings = 18 after update
- **Denominator:** All unique (source_type, source_id) pairs = 44
- **How verified:** Automated test `Test 1` confirms 17 transcripts after initial import. `Test 5` confirms 18 after update. The test counts `hasUsableTranscript()` results and asserts exact numbers.
- **17 vs 18:** M07's transcript is withheld in the initial batch (unavailable_reason: "Transcript not included in this delivery; a later assessment batch supplies it.") and supplied in the update. The count goes from 17 to 18.

**Key analytical conclusion — M07 routes to customer_support**
- **Evidence:** Turn 2: "The first one is editing the description." Turn 8: "I cannot upload a document." Turn 19: "payments appear to have been released but are stuck showing Processing." Turn 22: "The amount from the previous item appears in the next one."
- **Rule:** Keyword match for "issue", "cannot upload", "stuck", "Processing" → customer_support route
- **How verified:** Automated test `Routing sanity` confirms M07 after update routes to customer_support. The detail view shows each evidence passage with speaker, timecode, and turn number for human verification.

---

## Slide 5: Trade-offs, AI Usage, Limitations, and Future Improvements

**Title:** Trade-offs and What I Would Improve

**AI usage:**
- No AI model or LLM is used at runtime. All analysis is deterministic, rule-based, and clearly labeled.
- The manager brief is pre-generated by reading the transcripts and writing findings manually. This is disclosed in the README and in the app.

**Key trade-offs:**
- **Rule-based vs. ML routing:** Keyword matching is transparent and explainable but may miss nuanced patterns. Accepted this trade-off for auditability.
- **Multi-route vs. single-route:** Multi-route preserves information but makes the inbox slightly more complex. Accepted for accuracy.
- **localStorage vs. backend:** No backend means the app is simple to run but limited to single-browser persistence. Accepted for the assignment scope.

**Known limitations:**
1. Single-day sample — date charts are not meaningful
2. No verified CRM data — no deal values or account relationships
3. No cross-meeting speaker identity
4. Keyword-based rules may miss subtle patterns
5. localStorage is browser-specific

**Future improvements:**
- Add fuzzy/semantic matching for routing beyond exact keywords
- Add a timeline view when multi-day data is available
- Add CSV import for bulk route corrections
- Add a comparison view for before/after update analysis
- Integrate with a CRM API for deal-stage context (when available)
