/**
 * Pre-generated manager brief for 21 August 2026 (Asia/Kolkata).
 * This is a static document, not dynamically generated from filters.
 * It reviews all 18 conversations with usable text after applying the update batch.
 *
 * IMPORTANT: This brief is pre-generated. It does not react to dashboard filters.
 * All analysis is rule-based and deterministic. No AI model was used.
 */

export const MANAGER_BRIEF = {
  date: '2026-08-21',
  timezone: 'Asia/Kolkata',
  isPreGenerated: true,
  isRuleBased: true,
  summary: `Manager brief for 21 August 2026 (Asia/Kolkata). This covers 44 source records: 30 calls and 14 meetings. 18 records have usable supplied transcript text (10 calls + 8 meetings after applying the update batch). The remaining 26 records have no usable text and are tracked for intake only. This is a single-day selected sample, not a representative team performance review.`,
  sections: [
    {
      title: 'Important conversations requiring follow-up',
      items: [
        {
          ref: 'M03',
          title: 'Asterloom Systems / SpendNest discussion',
          finding: 'Prospect evaluating prepaid corporate cards to replace employee reimbursement. They need CFO approval before proceeding. Starting scope is 4-5 employees. Price was discussed: INR 26,000 annual plus INR 13,000 setup. The prospect pushed back on a price increase from INR 26,000 to INR 39,000 — the rep clarified the difference was the one-time setup fee.',
          evidence: 'Turn 23-24: "But you previously told me INR 26,000. Why has that become INR 39,000?" / "I included the integration setup in that number."',
          action: 'Send the cards proposal. Follow up after their internal CFO discussion.',
          route: 'Sales follow-up',
          uncertainty: 'No commitment was made. The CFO has not been involved yet. The prospect may decline.',
        },
        {
          ref: 'M04',
          title: 'Cedarwave Distribution / SpendNest discussion',
          finding: 'Existing customer being migrated to a replacement prepaid card programme but explicitly wants credit cards instead. A bank-issued credit card integration path was discussed. The customer has a corporate credit line of INR 1.3 crore with some cards already issued. Accounting integration feasibility for bank-card transactions needs team confirmation.',
          evidence: 'Turn 11: "moving from prepaid to credit is the main issue for us." Turn 22: "We already have a corporate credit line of about INR 1.3 crore."',
          action: 'Confirm bank-card feed eligibility and accounting integration feasibility with the programme team. Customer will decide internally.',
          route: 'Sales follow-up + Customer support',
          uncertainty: 'Bank-card integration eligibility is unconfirmed. The customer has not committed to the migration.',
        },
        {
          ref: 'M02',
          title: 'LedgerBridge / SpendNest discussion',
          finding: 'Strategic partnership discussion about integrating compliant electronic invoicing. The partner demonstrated the product and proposed two commercial models. SpendNest aims for Q4 launch starting with Singapore and Australia. Setup costs: EUR 2,600 basic or EUR 6,500 supported implementation.',
          evidence: 'Turn 13: "We are aiming for the fourth quarter. We would start with Singapore and Australia, then India." Turn 31: "EUR 2,600; a more supported implementation starts at EUR 6,500."',
          action: 'Complete the volume template (countries, customer sizes, invoice volumes). Schedule the commercial call after internal briefing.',
          route: 'Partnership follow-up',
          uncertainty: 'Issued invoice volumes are estimates since the receivables product is still being built. The Q4 timeline could slip to early next year.',
        },
        {
          ref: 'M07',
          title: 'Willowfield Trust / SpendNest discussion (updated)',
          finding: 'Customer reported four product issues: (1) description editing not saving, (2) file upload failing on payment recreation screen, (3) reimbursements stuck in Processing state, (4) incorrect amount carry-forward on Mark as paid screen. A workaround was identified for the upload issue.',
          evidence: 'Turn 2: "The first one is editing the description." Turn 8: "I cannot upload a document." Turn 19: "The payments appear to have been released but are stuck showing Processing." Turn 22: "The amount from the previous item appears in the next one."',
          action: 'Report all four issues to the engineering team. The upload workaround (using Bill pay > Review) is communicated. Follow up with confirmation.',
          route: 'Customer support',
          uncertainty: 'Root causes are not yet diagnosed. The Processing state issue may affect other users.',
        },
      ],
    },
    {
      title: 'Sales coaching observations',
      items: [
        {
          ref: 'C01',
          title: 'Cold call to Harborlight Advisory prospect',
          finding: 'The prospect objected strongly to being cold-called, asking "why are you calling?" and "where did you find my details?" The rep acknowledged it was a cold call but could not recover the conversation. The prospect did briefly ask what the company does before declining.',
          evidence: 'Quote: "I didn\'t ask for this call, and I\'m not interested. This number is for my work, not for people to sell things to me."',
          action: 'Coaching on list-source transparency and objection handling. Consider reviewing the contact acquisition programme for this segment.',
          route: 'Sales coaching',
          uncertainty: 'The prospect may have been receptive with a warmer approach, but this is speculative.',
        },
        {
          ref: 'C03',
          title: 'Follow-up call with poor audio quality',
          finding: 'Kirans follow-up call about API access was undermined by poor audio quality. The prospect could barely hear and asked to continue by email. The rep handled the situation professionally by suggesting email and Monday follow-up.',
          evidence: 'Quote: "I\'m struggling to catch what you\'re saying. I\'m outside, and it may be my phone. Could we do this by email?"',
          action: 'Send the email with subject "Developer access and event notifications — follow-up". Confirm audio quality before substantive calls.',
          route: 'Sales follow-up + Sales coaching',
          uncertainty: 'The prospects level of interest is unclear. They mentioned it "isn\'t essential enough for us to spend much on it."',
        },
        {
          ref: 'C05',
          title: 'Introductory call — prospect already has coverage',
          finding: 'Meeras call to a prospect who already has StoreHarbor and other systems covering expense management and vendor payments. The prospect asked for a presentation but only as a backup if they decide to change providers.',
          evidence: 'Quote: "If we ever decide to change the providers we already have, we could consider it then."',
          action: 'Send the presentation. Low priority — this is a soft lead at best.',
          route: 'Sales follow-up',
          uncertainty: 'No current need expressed. The prospect was polite but not engaged.',
        },
      ],
    },
    {
      title: 'Partnership and referral signals',
      items: [
        {
          ref: 'M01',
          title: 'Harborpath Advisory / SpendNest discussion',
          finding: 'Partner advisory firm exploring virtual accounts for their clients. Discussion covered the boundary between registered businesses and personal accounts. The partner is open to referring clients. Needs product details for follow-up.',
          evidence: 'Turn 1: "My understanding was that you help people open bank accounts remotely." Turn 2: "we work with registered businesses, not individuals opening personal accounts."',
          action: 'Send product details. Schedule a follow-up to discuss referral mechanics.',
          route: 'Partnership follow-up',
          uncertainty: 'No referral agreement was established. The partner needs to evaluate fit for their client base.',
        },
        {
          ref: 'C07',
          title: 'Partnership outreach to Willowbank Advisory',
          finding: 'Dev called an advisory firm that helps companies incorporate overseas. They expressed openness to referring clients to SpendNest for virtual accounts. They asked for details via chat and agreed to a Monday follow-up call.',
          evidence: 'Quote: "We\'d like to partner with advisory firms such as yours so your clients can access a virtual business account after incorporation." / "Yes, that\'s something we normally do."',
          action: 'Send the proposal via chat. Call on Monday to discuss further.',
          route: 'Partnership follow-up',
          uncertainty: 'No formal agreement. The firm may already have referral relationships.',
        },
        {
          ref: 'C08',
          title: 'Referred prospect — Raghav',
          finding: 'Meera called a prospect who asked for a proposal and referred to a colleague handling people operations and frontline processes. Email address contact08@example.com was confirmed.',
          evidence: 'Quote: "If you send him a proposal and say you spoke with me, he can take a look."',
          action: 'Send the proposal to contact08@example.com, mentioning the referrer.',
          route: 'Sales follow-up',
          uncertainty: 'The referrer was not the decision-maker. Internal interest is uncertain.',
        },
      ],
    },
    {
      title: 'Internal operations and training',
      items: [
        {
          ref: 'M10',
          title: 'Billing workflow walkthrough (internal training)',
          finding: 'Internal training on billing operations: invoice generation, payment retry sequence (3 attempts over 10 days), account freezing, and manual recovery. Attendees need back-office super-admin access for the next session.',
          evidence: 'Turn 7: "The nominal due period is seven days, but we sometimes give the customer until the end of the month." Turn 17: "On the tenth day, if there is enough money, the invoice clears..."',
          action: 'Request back-office access for attendees. Schedule next training session.',
          route: 'Internal / vendor ops',
          uncertainty: 'None — this is a factual training record.',
        },
        {
          ref: 'M09',
          title: 'Account setup and workflow discussion',
          finding: 'Customer needs account setup for Brookmint Holdings (invitation expired). Also raised access-control concerns about shared mailbox permissions. Wants separate personal identities for two companies. The login token issue needs team escalation.',
          evidence: 'Turn 21: "It says the token has expired. This is the fresh message we just received." Turn 17: "I do not want this to depend on trusting someone not to use access that is available."',
          action: 'Escalate the expired-token issue to the team. Follow up by Monday. Customer will speak to IT about separate identities.',
          route: 'Security / access escalation + Customer support',
          uncertainty: 'Token expiry cause is unknown. The customer may need a different access model.',
        },
      ],
    },
    {
      title: 'Records with no usable transcript',
      items: [
        {
          finding: '20 calls and 6 meetings have no usable transcript text. These are tracked for intake but no substantive analysis is produced. 4 meetings have zero turns with explicit reasons (no speech, notetaker cancelled, not scheduled). 2 meetings (M05, M08, M11) have has_transcript=true but turns=[] with "nobody spoke". M12 and M14 had the notetaker cancelled. M13 was never scheduled.',
          action: 'Review source systems to determine if transcripts exist for high-value records. No fabricated analysis is assigned.',
          route: 'Human review needed',
        },
      ],
    },
  ],
}
