# Three Evidence-Backed Findings

All evidence is drawn from the supplied dataset. No quotes or metrics are invented.

## Finding 1: Willowfield Trust reported multiple product bugs in a single support session (M07)

**What was noticed:** After the update batch supplied M07's transcript, the conversation revealed four distinct product issues reported by the customer in a single session: (1) editing a payment description that does not save, (2) a file upload failing on the payment recreation screen, (3) reimbursement payments stuck showing "Processing" despite appearing released, and (4) an incorrect amount carrying forward on the "Mark as paid" screen.

**Supporting passage (exact transcript quote, M07, update batch):**
- Turn 2: "The first one is editing the description. I am changing this event-payment description to a short reference and clicking..."
- Turn 8: "Next is Recreate payment. Can we look at that here? When I go through this route, I cannot upload a document."
- Turn 19: "The payments appear to have been released but are stuck showing Processing."
- Turn 22: "The amount from the previous item appears in the next one. Each time I have to cancel, leave it and open Mark as paid again."

**Source record reference:** M07, source_type: meeting, source_id: 4f304fff-fd40-5cfc-a366-0a134c445c2a, revision 2.

**Why it matters:** Four bugs in a single session suggests systemic issues in the payment and reimbursement workflows. The "Processing" state issue was confirmed to affect another user (Turn 18), meaning it is not isolated. A workaround was found for the upload issue but the root causes of the other three remain open.

**Where it affects the product:**
- **Routing engine**: M07 is routed to `customer_support` based on keyword detection of "issue", "cannot upload", "stuck", "Processing" in the transcript text.
- **Detail view**: The evidence passages are displayed with speaker labels, timecodes, and turn numbers on the M07 detail page.
- **Manager brief**: M07 is listed under "Important conversations requiring follow-up" with all four issues summarized.
- **Export**: The analysis.json for M07 in the ZIP archive contains the full evidence list.

## Finding 2: Asterloom Systems prospect was quoted two different prices, creating a trust risk (M03)

**What was noticed:** The prospect was initially told INR 26,000 for the annual subscription, then heard INR 39,000 in a later conversation. The SpendNest team member clarified that the INR 39,000 figure included a one-time setup fee (INR 13,000), separating the recurring INR 26,000 from the setup. The prospect explicitly challenged this discrepancy, which indicates a trust issue that could block the deal.

**Supporting passage (exact transcript quote, M03):**
- Turn 23: "But you previously told me INR 26,000. Why has that become INR 39,000?"
- Turn 24: "I included the integration setup in that number. To separate it: INR 26,000 plus tax is the recurring annual subscription, and INR 13,000 is the one-time accounting integration setup."

**Source record reference:** M03, source_type: meeting, source_id: 398672e7-... (record_ref M03), revision 1.

**Why it matters:** A price discrepancy mid-evaluation can damage trust and delay or kill a deal. The prospect's CFO has not yet been involved (Turn 28: "Our CFO approves the larger payments. We need to explain the proposal to them"), so the pricing clarity issue must be resolved before the internal approval stage.

**Where it affects the product:**
- **Routing engine**: M03 is routed to `sales_follow_up` based on "proposal", "CFO", "decide", and "follow-up" signals.
- **Detail view**: The evidence passage for the pricing discussion is shown with speaker and turn number on the M03 detail page.
- **Manager brief**: M03 is listed under "Important conversations requiring follow-up" with the pricing discrepancy and CFO approval gap noted.
- **Analysis**: The summary explicitly mentions the price challenge and the need for CFO approval.

## Finding 3: Cold call to Harborlight Advisory prospect triggered a hostile reaction, revealing a list-source transparency gap (C01)

**What was noticed:** The prospect objected strongly to being cold-called, asking both "why are you calling?" and "where did you find my details?" The rep acknowledged it was a cold call but could not recover the conversation. The prospect did briefly ask what the company does before declining, suggesting the outreach was not inherently unwelcome but the approach was mishandled.

**Supporting passage (exact transcript quote, C01):**
- "I didn't ask for this call, and I'm not interested. This number is for my work, not for people to sell things to me."
- "Then where did you find my details?"
- "just briefly, what does your company actually do?"

**Source record reference:** C01, source_type: call, source_id: 2ec4404c-beee-5377-a63c-aab701da08ed, revision 1.

**Why it matters:** The prospect's reaction reveals two coaching areas: (1) list-source transparency — the rep could not clearly explain how the contact was obtained beyond "a professional networking outreach programme", and (2) objection handling — the rep acknowledged "it is a cold call" without redirecting to value. The prospect's brief curiosity ("what does your company actually do?") suggests a warmer approach could have opened a conversation.

**Where it affects the product:**
- **Routing engine**: C01 is routed to `sales_coaching` based on detection of "cold call", "didn't ask for this call", and "how did you find my" patterns.
- **Detail view**: The evidence passages show the cold-call resistance and the prospect's brief curiosity. The analysis summary calls out the coaching opportunity.
- **Manager brief**: C01 is listed under "Sales coaching observations" with the specific coaching recommendation on objection handling and list-source transparency.
