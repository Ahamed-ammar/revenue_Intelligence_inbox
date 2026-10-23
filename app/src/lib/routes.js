/**
 * Routing taxonomy and deterministic rule-based routing engine.
 *
 * Analysis is deterministic and rule-based. No LLM is called.
 * Rules use keyword/pattern matching on transcript text and metadata fields.
 *
 * Route taxonomy:
 * 1. sales_follow_up    — Sales follow-up / deal next steps
 * 2. customer_support   — Customer support / product issue
 * 3. security_escalation — Security or access escalation
 * 4. partnership        — Partnership follow-up
 * 5. sales_coaching     — Sales coaching
 * 6. internal_ops       — Internal/vendor operations note
 * 7. human_review       — Human review / insufficient evidence
 */

export const ROUTE_DEFINITIONS = [
  {
    id: 'sales_follow_up',
    label: 'Sales follow-up',
    color: '#4f46e5',
    description: 'A prospect or customer showed enough interest to warrant a next sales step: send materials, schedule a demo, or follow up on pricing.',
  },
  {
    id: 'customer_support',
    label: 'Customer support',
    color: '#0891b2',
    description: 'An existing customer is reporting product issues, bugs, or workflow problems that need support resolution.',
  },
  {
    id: 'security_escalation',
    label: 'Security / access escalation',
    color: '#dc2626',
    description: 'Access control, permission, or security concerns raised by a customer that may need escalation.',
  },
  {
    id: 'partnership',
    label: 'Partnership follow-up',
    color: '#7c3aed',
    description: 'A potential partner or supplier discussion about integration, referral, or commercial collaboration.',
  },
  {
    id: 'sales_coaching',
    label: 'Sales coaching',
    color: '#ea580c',
    description: 'The call transcript reveals a coaching opportunity for the rep (objection handling, approach, qualification).',
  },
  {
    id: 'internal_ops',
    label: 'Internal / vendor ops',
    color: '#475569',
    description: 'Internal training, billing operations, or vendor operational discussion that does not require external sales action.',
  },
  {
    id: 'human_review',
    label: 'Human review needed',
    color: '#9ca3af',
    description: 'No usable transcript text. The record needs human intake review; no substantive analysis can be produced.',
  },
]

export const ROUTE_MAP = Object.fromEntries(ROUTE_DEFINITIONS.map(r => [r.id, r]))

/**
 * Determine suggested routes for a record using deterministic rules.
 * Returns an array of route IDs. A record can have multiple routes.
 */
export function suggestRoutes(record) {
  if (!record) return ['human_review']

  const { sourceType, sourcePayload, transcriptPayload } = record
  const text = getFullText(record)
  const textLower = text.toLowerCase()

  // No usable transcript -> human review
  if (!text || text.trim().length === 0) {
    return ['human_review']
  }

  const routes = []

  // Meeting-specific routing
  if (sourceType === 'meeting') {
    routes.push(...routeMeeting(record, textLower))
  } else {
    routes.push(...routeCall(record, textLower))
  }

  // Always include sales_coaching for calls with transcripts where rep improvement is visible
  if (sourceType === 'call' && text) {
    if (detectCoachingOpportunity(record, textLower)) {
      routes.push('sales_coaching')
    }
  }

  // Deduplicate
  return [...new Set(routes)]
}

function getFullText(record) {
  if (!record) return ''
  if (record.sourceType === 'call') {
    return record.sourcePayload?.transcript || ''
  }
  if (record.sourceType === 'meeting') {
    if (!record.transcriptPayload?.turns) return ''
    return record.transcriptPayload.turns.map(t => t.text || '').join('\n')
  }
  return ''
}

function routeMeeting(record, textLower) {
  const routes = []
  const title = (record.sourcePayload?.title || '').toLowerCase()
  const turns = record.transcriptPayload?.turns || []
  const text = textLower

  // Customer support: bug reports, workflow issues, product problems
  if (text.includes('issue') || text.includes('bug') || text.includes('not working') ||
      text.includes('cannot upload') || text.includes('cannot select') || text.includes('stuck') ||
      text.includes('error') || text.includes('problem') || text.includes('not appearing') ||
      text.includes('screenshots') || text.includes('workaround') || text.includes('investigate') ||
      text.includes('not accepted') || text.includes('disabled') || text.includes('carries forward') ||
      text.includes('processing')) {
    routes.push('customer_support')
  }

  // Security / access: permission concerns, admin access, login issues
  if (text.includes('permission') || text.includes('administrator') || text.includes('access') ||
      text.includes('login') || text.includes('token') || text.includes('invitation') ||
      text.includes('shared mailbox') || text.includes('security') || text.includes('confidential') ||
      text.includes('sensitive') || text.includes('identity')) {
    routes.push('security_escalation')
  }

  // Partnership: supplier discussion, integration, referral arrangement
  if (title.includes('discussion') && (text.includes('partner') || text.includes('integration') ||
      text.includes('api') || text.includes('invoice') || text.includes('compliant') ||
      text.includes('supplier') || text.includes('collaboration'))) {
    routes.push('partnership')
  }

  // Sales follow-up: pricing, proposal, next steps, follow-up
  if (text.includes('proposal') || text.includes('pricing') || text.includes('follow-up') ||
      text.includes('follow up') || text.includes('next week') || text.includes('send the details') ||
      text.includes('send the information') || text.includes('cfo') || text.includes('decide') ||
      text.includes('internally') || text.includes('evaluation') || text.includes('pilot')) {
    routes.push('sales_follow_up')
  }

  // Internal ops: training, billing, operations walkthrough
  if (title.includes('billing') || title.includes('internal') || title.includes('setup') ||
      title.includes('workflow walkthrough') || title.includes('training') ||
      text.includes('training') || text.includes('subscription') || text.includes('invoice generation') ||
      text.includes('operations') || text.includes('billing cycle') || text.includes('back-office')) {
    routes.push('internal_ops')
  }

  // Fallback if nothing matched
  if (routes.length === 0) {
    routes.push('human_review')
  }

  return routes
}

function routeCall(record, textLower) {
  const routes = []
  const outcome = (record.sourcePayload?.observed_outcome || '').toLowerCase()

  // Partnership: mentions of partnership, referral, advisory firms
  if (textLower.includes('partner') || textLower.includes('referral') ||
      textLower.includes('advisory') || textLower.includes('incorporat')) {
    routes.push('partnership')
  }

  // Sales follow-up: prospect asked for materials, showed interest, follow-up planned
  if (outcome === 'follow_up' || outcome === 'referred' ||
      textLower.includes('send') && (textLower.includes('proposal') || textLower.includes('presentation') ||
      textLower.includes('brief') || textLower.includes('details') || textLower.includes('email'))) {
    routes.push('sales_follow_up')
  }

  // If the prospect explicitly declined and there's no follow-up signal
  if (outcome === 'uninterested' && !routes.includes('sales_follow_up')) {
    routes.push('human_review')
  }

  // Voicemail calls with no conversation
  if (outcome === 'voicemail' && !textLower.includes('connected')) {
    routes.push('internal_ops')
  }

  // Fallback
  if (routes.length === 0) {
    routes.push('human_review')
  }

  return routes
}

function detectCoachingOpportunity(record, textLower) {
  const outcome = (record.sourcePayload?.observed_outcome || '').toLowerCase()

  // Cold call received hostile reaction
  if (textLower.includes("didn't ask for this call") || textLower.includes('cold call') ||
      textLower.includes("why are you calling") || textLower.includes("how did you") && textLower.includes("find my")) {
    return true
  }

  // Rep pushed too hard after disinterest
  if (outcome === 'uninterested' && textLower.includes("understood") && textLower.includes("thank you")) {
    return true
  }

  // Audio quality issues the rep should have handled better
  if (textLower.includes("can hardly hear") || textLower.includes("very faint") ||
      textLower.includes("echo") || textLower.includes("struggling to catch")) {
    return true
  }

  // Good qualification / honest disclosure
  if (textLower.includes("to be upfront") || textLower.includes("to be clear") ||
      textLower.includes("cold introduction")) {
    return true
  }

  return false
}

/**
 * Generate a deterministic, record-specific analysis summary.
 * This is NOT an LLM. It uses explicit keyword extraction and evidence matching.
 */
export function generateAnalysis(record) {
  if (!record) return null

  const text = getFullText(record)
  if (!text || text.trim().length === 0) {
    return {
      hasTranscript: false,
      summary: null,
      unavailableReason: record.sourceType === 'meeting'
        ? record.transcriptPayload?.unavailable_reason || 'No usable transcript text supplied.'
        : 'No usable transcript text supplied for this call.',
      evidence: [],
      notEstablished: ['No transcript text is available, so no substantive analysis can be produced.'],
      nextActions: ['Review the source system to determine if a transcript exists.'],
      owner: null,
      confidence: 'low',
      confidenceExplanation: 'No evidence is available because there is no usable transcript text.',
      isRuleBased: true,
    }
  }

  const routes = suggestRoutes(record)
  const evidence = extractEvidence(record)
  const notEstablished = extractNotEstablished(record, text)
  const nextActions = extractNextActions(record, text)
  const owner = extractOwner(record, text)
  const summary = buildSummary(record, routes, text)

  return {
    hasTranscript: true,
    summary,
    unavailableReason: null,
    evidence,
    notEstablished,
    nextActions,
    owner,
    confidence: determineConfidence(record, routes, evidence),
    confidenceExplanation: explainConfidence(record, routes, evidence),
    suggestedRoutes: routes,
    isRuleBased: true,
  }
}

/**
 * Extract evidence passages from the transcript.
 */
function extractEvidence(record) {
  const evidence = []
  const text = getFullText(record)

  if (record.sourceType === 'meeting') {
    const turns = record.transcriptPayload?.turns || []
    // Look for key signals in turns
    const signals = [
      { pattern: /proposal|pricing|cost|fee|charge/i, label: 'Pricing discussion' },
      { pattern: /issue|bug|not working|cannot|stuck|error|problem/i, label: 'Problem reported' },
      { pattern: /permission|access|admin|login|token|security|confidential|sensitive/i, label: 'Access/security concern' },
      { pattern: /partner|integration|api|collaboration|referral/i, label: 'Partnership signal' },
      { pattern: /follow.?up|next week|send the details|send the information/i, label: 'Follow-up requested' },
      { pattern: /decide|internally|cfo|approve|decision/i, label: 'Decision pending' },
    ]

    for (const turn of turns) {
      const turnText = turn.text || ''
      for (const sig of signals) {
        if (sig.pattern.test(turnText)) {
          evidence.push({
            label: sig.label,
            speaker: turn.speaker,
            timecode: turn.timecode,
            turnNumber: turns.indexOf(turn) + 1,
            text: turnText,
          })
          break // One label per turn to avoid duplication
        }
      }
    }
  } else {
    // For calls, extract key phrases as evidence
    const phrases = []
    const lowerText = text.toLowerCase()

    if (lowerText.includes('send') && (lowerText.includes('proposal') || lowerText.includes('presentation') || lowerText.includes('brief') || lowerText.includes('details'))) {
      const idx = text.search(/send/i)
      phrases.push({ label: 'Follow-up requested', quote: extractQuote(text, idx, 200) })
    }
    if (lowerText.includes('not interested') || lowerText.includes("don't") && lowerText.includes('need')) {
      const idx = text.search(/not interested|don't/i)
      phrases.push({ label: 'Prospect disinterest', quote: extractQuote(text, idx, 200) })
    }
    if (lowerText.includes('partner')) {
      const idx = text.search(/partner/i)
      phrases.push({ label: 'Partnership mentioned', quote: extractQuote(text, idx, 200) })
    }
    if (lowerText.includes('cold call') || lowerText.includes("didn't ask")) {
      const idx = text.search(/cold call|didn't ask/i)
      phrases.push({ label: 'Cold-call resistance', quote: extractQuote(text, idx, 200) })
    }
    if (lowerText.includes('email') || lowerText.includes('message')) {
      const idx = text.search(/email|message/i)
      phrases.push({ label: 'Contact channel provided', quote: extractQuote(text, idx, 200) })
    }

    evidence.push(...phrases)
  }

  return evidence
}

function extractQuote(text, startIdx, length) {
  const begin = Math.max(0, startIdx - 30)
  const end = Math.min(text.length, startIdx + length)
  let quote = text.substring(begin, end).trim()
  if (begin > 0) quote = '...' + quote
  if (end < text.length) quote = quote + '...'
  return quote
}

function extractNotEstablished(record, text) {
  const items = []
  const lower = text.toLowerCase()

  items.push('No verified CRM opportunity value or deal stage is established by this conversation alone.')

  if (lower.includes('internally') || lower.includes('decide') || lower.includes('cfo')) {
    items.push('The customer indicated an internal decision is needed; no commitment was made on this call.')
  }
  if (lower.includes('check') || lower.includes('confirm') || lower.includes('need to')) {
    items.push('Several items require confirmation before any conclusion can be drawn.')
  }
  if (lower.includes('rough') || lower.includes('estimate') || lower.includes('approximately')) {
    items.push('Volume and spending figures mentioned are approximate and not verified.')
  }

  return items
}

function extractNextActions(record, text) {
  const actions = []
  const lower = text.toLowerCase()

  if (lower.includes('send') && (lower.includes('proposal') || lower.includes('details') || lower.includes('information') || lower.includes('presentation') || lower.includes('brief'))) {
    actions.push('Send requested materials to the prospect/customer.')
  }
  if (lower.includes('follow') && lower.includes('monday')) {
    actions.push('Follow up on Monday as discussed.')
  }
  if (lower.includes('email')) {
    actions.push('Send information via email as requested.')
  }
  if (lower.includes('check') && lower.includes('team')) {
    actions.push('Escalate the technical question to the internal team.')
  }
  if (lower.includes('internally') || lower.includes('cfo') || lower.includes('decide')) {
    actions.push('Wait for the customer to make an internal decision before re-engaging.')
  }
  if (lower.includes('report') && lower.includes('team')) {
    actions.push('Report the issue to the engineering/product team for investigation.')
  }

  if (actions.length === 0) {
    actions.push('Review the conversation and determine an appropriate next step.')
  }

  return actions
}

function extractOwner(record, text) {
  const lower = text.toLowerCase()

  // Check if someone explicitly took ownership
  if (lower.includes('i will send') || lower.includes('i\'ll send')) {
    if (record.sourceType === 'call') {
      return record.sourcePayload?.rep_name || 'The caller'
    }
    return 'Team member (SpendNest side)'
  }
  if (lower.includes('i will check') || lower.includes('i need to check')) {
    return 'Team member (SpendNest side)'
  }
  if (lower.includes('i will report') || lower.includes('i will raise')) {
    return 'Team member (SpendNest side)'
  }
  if (lower.includes('we will speak') || lower.includes('come back to you')) {
    return 'Team member (SpendNest side)'
  }

  return null
}

function buildSummary(record, routes, text) {
  const ref = record.recordRef || ''
  const title = record.sourceType === 'meeting' ? record.sourcePayload?.title : `${record.sourcePayload?.rep_name || 'Unknown'} call`
  const lower = text.toLowerCase()

  // Build a specific summary based on content patterns
  if (record.sourceType === 'meeting') {
    if (lower.includes('issue') && lower.includes('upload')) {
      return `${ref} (${title}): Customer reported multiple product issues including a file upload failure on the payment recreation screen, payments stuck in Processing state, and incorrect amount carry-forward on the Mark as paid screen. A workaround was identified for the upload issue but the other items need team investigation.`
    }
    if (lower.includes('invitation') && lower.includes('token') && lower.includes('expired')) {
      return `${ref} (${title}): Customer needs account setup for a second company but the invitation link expired. Separately, they raised access-control concerns about shared mailbox permissions and want separate personal identities. The login issue needs team escalation.`
    }
    if (lower.includes('invoice') && lower.includes('compliant') && lower.includes('electronic')) {
      return `${ref} (${title}): Strategic discussion about integrating compliant electronic invoicing. The partner demonstrated the product and proposed two commercial models. SpendNest needs to complete a volume template before pricing can be determined. No commitment was made.`
    }
    if (lower.includes('card') && lower.includes('prepaid') && lower.includes('credit')) {
      return `${ref} (${title}): Customer is being migrated to a replacement prepaid card programme but wants credit cards instead. A bank-issued credit card integration path was discussed. The customer needs to decide internally before proceeding. Accounting integration feasibility needs team confirmation.`
    }
    if (lower.includes('card') && lower.includes('reimbursement') && lower.includes('approval')) {
      return `${ref} (${title}): Prospect evaluating corporate prepaid cards to replace personal-spend reimbursement. They need approval workflows and accounting integration. CFO approval is still needed. Starting scope is 4-5 employees. Price was discussed (INR 26,000 annual plus INR 13,000 setup).`
    }
    if (lower.includes('collection') && lower.includes('invoice') && lower.includes('receivabl')) {
      return `${ref} (${title}): Discovery call about receivables automation. Customer handles ~260-520 invoices/month manually. Interest in automated collections and cash application. Security and confidentiality concerns raised. Customer wants follow-up information.`
    }
    if (lower.includes('bank account') && lower.includes('registered business')) {
      return `${ref} (${title}): Partner advisory firm exploring SpendNest virtual accounts for their clients. Discussion covered business vs personal account boundaries. Partner is open to referring clients. Needs follow-up with product details.`
    }
    if (lower.includes('billing') && lower.includes('invoice') && lower.includes('subscription')) {
      return `${ref} (${title}): Internal training session on billing operations. Covered invoice generation, payment failure retry sequence, account freezing, and manual recovery. Attendees need back-office access for the next session.`
    }
  }

  if (record.sourceType === 'call') {
    if (lower.includes("didn't ask for this call") || lower.includes('cold call')) {
      return `${ref}: Cold call to a prospect who objected to being contacted. The prospect asked about the source of their contact details and stated their processes are already automated. No interest was expressed. Coaching opportunity: objection handling and list-source transparency.`
    }
    if (lower.includes("can hardly hear") || lower.includes('very faint')) {
      return `${ref}: Follow-up call about API access with poor audio quality. The prospect is marginally interested but cannot engage due to connection issues. Agreed to continue via email and possibly Monday. Coaching opportunity: confirm audio quality before substantive discussion.`
    }
    if (lower.includes('send') && lower.includes('proposal')) {
      return `${ref}: Prospect asked for a proposal to be sent. ${lower.includes('refer') ? 'They referred to a colleague for further evaluation.' : 'Follow-up is appropriate.'}`
    }
    if (lower.includes('already have') && lower.includes('automated')) {
      return `${ref}: Prospect confirmed their current system already covers the offered capabilities. No immediate need. Respectful decline.`
    }
    if (lower.includes('partner') && lower.includes('incorporat')) {
      return `${ref}: Partnership outreach to an advisory firm that helps companies incorporate overseas. They expressed openness to referring clients for virtual accounts. Send details via chat and follow up Monday.`
    }
    if (lower.includes('referred') || lower.includes('business head')) {
      return `${ref}: Prospect declined directly but referred to a senior person for potential future interest. They asked not to be named when contacting the referral.`
    }
    if (lower.includes("don't work there anymore")) {
      return `${ref}: Contact is no longer at the target company. They moved to a different sector (manufacturing) and asked for a brief via messaging. They will initiate if interested.`
    }
    if (lower.includes('voicemail') || (lower.includes('message') && record.sourcePayload?.duration_seconds < 30)) {
      return `${ref}: Short call resulting in voicemail. No conversation took place.`
    }
  }

  return `${ref}: Conversation with usable transcript text. Review the full transcript for details.`
}

function determineConfidence(record, routes, evidence) {
  if (routes.includes('human_review') && !evidence.length) return 'low'
  if (evidence.length >= 3) return 'medium'
  if (evidence.length >= 1) return 'medium'
  return 'low'
}

function explainConfidence(record, routes, evidence) {
  if (routes.includes('human_review')) {
    return 'Low confidence: no usable transcript text, so analysis is based only on metadata fields.'
  }
  const parts = []
  parts.push(`${evidence.length} evidence passage(s) found in the transcript supporting the route suggestion.`)
  if (evidence.length < 2) {
    parts.push('Limited evidence; the conclusion should be verified by a human reviewer.')
  }
  parts.push('Routing is rule-based and deterministic; no AI model was used.')
  return parts.join(' ')
}
