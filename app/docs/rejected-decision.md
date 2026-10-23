# Rejected Decision: Single-Route Assignment per Record

## The alternative considered

I considered assigning exactly one route per conversation — a single "primary route" label for each record. This is simpler to implement and simpler to display: one badge per row in the inbox, one dropdown per detail view, and no ambiguity about which route takes precedence.

## Why it was rejected

Several conversations genuinely serve multiple purposes, and forcing a single label would lose information that a manager needs:

1. **M09 (Account setup and workflow discussion)**: The customer reports a login/token-expiry issue (security/access escalation) AND raises concerns about shared mailbox permissions (security concern) AND needs workflow training (internal ops). A single route would hide one of these needs.

2. **C03 (API access follow-up call)**: The call is a sales follow-up about developer access, but it also reveals an audio-quality problem that prevented a productive conversation — a coaching signal. Assigning only "sales follow-up" would lose the coaching insight.

3. **M04 (Cedarwave Distribution)**: The customer is being migrated to a replacement card programme (sales follow-up) but also reports integration issues (customer support) and discusses bank-issued credit card eligibility (partnership discussion).

4. **The data dictionary and assignment brief explicitly state**: "A conversation may need one destination, several destinations, or a human decision." Forcing a single route would violate this requirement.

## The trade-off accepted

Multi-route assignment makes the inbox table slightly more complex: a record may show 2-3 route badges instead of one. The dashboard's route counts can exceed the total record count (since one record can contribute to multiple route buckets), which requires an explanatory note. The manual override UI needs to show both the suggested routes and the selected manual route clearly.

The alternative — single-route assignment — is simpler but loses real information. A manager who sees only "sales follow-up" on M04 would not know that a support issue and an integration question are also pending. That is a worse outcome than a slightly more complex display.

## Where the choice is visible in the product

1. **Inbox table**: The route column shows multiple route badges per record when applicable.
2. **Dashboard**: The "Records by route" card includes a note: "Route count exceeds record count because some records have multiple routes."
3. **Detail view**: The routing section shows all suggested routes, and the manual override allows selecting one route from the taxonomy while the suggested routes remain visible.
4. **Routing engine** (`src/lib/routes.js`): The `suggestRoutes()` function returns an array, and multiple route IDs can be returned for a single record.
5. **Export manifest**: The `routes` field in the manifest is an array, not a single string.
