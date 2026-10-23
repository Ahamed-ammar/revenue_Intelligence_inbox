/**
 * Import engine: handles batch imports with identity-based deduplication,
 * revision ordering, and preservation of manual overrides.
 *
 * State model:
 *   records: Map<identity, RecordState>
 *   RecordState {
 *     identity: string,
 *     sourceType: string,
 *     sourceId: string,
 *     recordRef: string | null,
 *     sourcePayload: object,       // latest applied source payload
 *     transcriptPayload: object | null,
 *     appliedRevision: number,    // last applied source revision
 *     manualRoute: string | null, // user-set route, preserved across updates
 *     reviewState: 'pending' | 'reviewed' | 'attention',
 *     analysisFreshness: 'current' | 'pending_review' | 'stale',
 *     importedAt: ISO timestamp,
 *   }
 */
import { makeIdentity, validateRecord } from './identity.js'

const STORAGE_KEY = 'rii_state_v1'

/**
 * Create initial empty state.
 */
export function createInitialState() {
  return {
    records: {}, // keyed by identity string
    importLog: [],
  }
}

/**
 * Parse and validate a batch JSON string.
 * Returns { batch, errors } where batch is the parsed envelope or null.
 */
export function parseBatch(jsonString) {
  let parsed
  try {
    parsed = JSON.parse(jsonString)
  } catch (e) {
    return { batch: null, errors: ['Invalid JSON: ' + e.message] }
  }

  if (!parsed || typeof parsed !== 'object') {
    return { batch: null, errors: ['Top-level value is not a JSON object'] }
  }
  if (!Array.isArray(parsed.records)) {
    return { batch: null, errors: ['Missing or invalid "records" array'] }
  }
  if (typeof parsed.revision !== 'number') {
    return { batch: null, errors: ['Missing or invalid "revision" field (expected number)'] }
  }

  return { batch: parsed, errors: [] }
}

/**
 * Apply a parsed batch to the current state.
 * Returns { state, summary } where summary describes the import outcome.
 *
 * Rules (per DATA_CONTRACT.md):
 * 1. Identity is (source_type, source_id).
 * 2. Higher revision replaces; same or lower revision is ignored.
 * 3. Newer record replaces entire source payload and transcript_payload (including nulls).
 * 4. Manual route is never erased by source updates.
 * 5. When source text changes, mark analysis as pending_review (stale).
 */
export function applyBatch(state, batch, importedAt = new Date().toISOString()) {
  const newState = {
    records: { ...state.records },
    importLog: [...state.importLog],
  }

  const summary = {
    inserted: 0,
    updated: 0,
    ignoredStale: 0,
    rejected: 0,
    errors: [],
    batchId: batch.batch_id || '(unknown)',
    revision: batch.revision,
  }

  for (const record of batch.records) {
    const validationErrors = validateRecord(record)
    if (validationErrors.length > 0) {
      summary.rejected++
      summary.errors.push(`Rejected ${record.record_ref || 'unknown'}: ${validationErrors.join('; ')}`)
      continue
    }

    const id = makeIdentity(record.source_type, record.source_id)

    if (newState.records[id]) {
      const existing = newState.records[id]
      // Revision check: ignore same or older revisions
      if (batch.revision <= existing.appliedRevision) {
        summary.ignoredStale++
        continue
      }

      // Newer revision: replace entire source payload and transcript_payload
      const sourceTextChanged = hasSourceTextChanged(existing, record)
      newState.records[id] = {
        ...existing,
        recordRef: record.record_ref || existing.recordRef,
        sourcePayload: record.payload,
        transcriptPayload: record.transcript_payload !== undefined ? record.transcript_payload : null,
        appliedRevision: batch.revision,
        analysisFreshness: sourceTextChanged ? 'pending_review' : existing.analysisFreshness,
        importedAt,
      }
      summary.updated++
    } else {
      // New record
      newState.records[id] = {
        identity: id,
        sourceType: record.source_type,
        sourceId: record.source_id,
        recordRef: record.record_ref || null,
        sourcePayload: record.payload,
        transcriptPayload: record.transcript_payload !== undefined ? record.transcript_payload : null,
        appliedRevision: batch.revision,
        manualRoute: null,
        reviewState: 'pending',
        analysisFreshness: 'current',
        importedAt,
      }
      summary.inserted++
    }
  }

  newState.importLog.push({
    batchId: summary.batchId,
    revision: summary.revision,
    importedAt,
    inserted: summary.inserted,
    updated: summary.updated,
    ignoredStale: summary.ignoredStale,
    rejected: summary.rejected,
  })

  return { state: newState, summary }
}

/**
 * Check if the source text content changed between old and new record.
 */
function hasSourceTextChanged(oldState, newRecord) {
  const oldText = extractSourceText(oldState.sourcePayload, oldState.transcriptPayload, oldState.sourceType)
  const newText = extractSourceText(newRecord.payload, newRecord.transcript_payload, newRecord.source_type)
  return oldText !== newText
}

function extractSourceText(payload, transcriptPayload, sourceType) {
  if (sourceType === 'call') {
    return payload?.transcript || ''
  }
  if (sourceType === 'meeting') {
    if (!transcriptPayload?.turns) return ''
    return transcriptPayload.turns.map(t => t.text || '').join('\n')
  }
  return ''
}

/**
 * Set manual route override. This is separate from the suggested route
 * and survives source updates.
 */
export function setManualRoute(state, identity, route) {
  const newState = {
    ...state,
    records: {
      ...state.records,
      [identity]: {
        ...state.records[identity],
        manualRoute: route,
        reviewState: 'reviewed',
      },
    },
  }
  return newState
}

/**
 * Reset manual route (clear the override).
 */
export function resetManualRoute(state, identity) {
  const newState = {
    ...state,
    records: {
      ...state.records,
      [identity]: {
        ...state.records[identity],
        manualRoute: null,
        reviewState: 'pending',
      },
    },
  }
  return newState
}

/**
 * Set review state for a record.
 */
export function setReviewState(state, identity, reviewState) {
  const newState = {
    ...state,
    records: {
      ...state.records,
      [identity]: {
        ...state.records[identity],
        reviewState,
      },
    },
  }
  return newState
}

/**
 * Mark analysis as reviewed (accept current analysis for current revision).
 */
export function markAnalysisReviewed(state, identity) {
  const newState = {
    ...state,
    records: {
      ...state.records,
      [identity]: {
        ...state.records[identity],
        analysisFreshness: 'current',
      },
    },
  }
  return newState
}

/**
 * Get all records as an array.
 */
export function getAllRecords(state) {
  return Object.values(state.records)
}

/**
 * Get count of unique records.
 */
export function getUniqueCount(state) {
  return Object.keys(state.records).length
}

/**
 * Persist state to localStorage.
 */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch (e) {
    console.error('Failed to save state:', e)
    return false
  }
}

/**
 * Load state from localStorage.
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to load state:', e)
    return null
  }
}

/**
 * Clear all state from localStorage.
 */
export function clearState() {
  localStorage.removeItem(STORAGE_KEY)
}
