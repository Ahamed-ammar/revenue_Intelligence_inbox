/**
 * Data normalization utilities.
 * Extracts a consistent shape from stored record state.
 * State records use camelCase: sourceType, sourcePayload, transcriptPayload, recordRef
 */
import { makeIdentity } from './identity.js'

/**
 * Determine whether a record has usable supplied transcript text.
 * Calls: sourcePayload.transcript (non-blank string)
 * Meetings: transcriptPayload.turns with at least one non-blank turn text
 */
export function hasUsableTranscript(record) {
  if (!record) return false
  if (record.sourceType === 'call' || record.source_type === 'call') {
    const transcript = record.sourcePayload?.transcript ?? record.payload?.transcript
    return typeof transcript === 'string' && transcript.trim().length > 0
  }
  if (record.sourceType === 'meeting' || record.source_type === 'meeting') {
    const turns = record.transcriptPayload?.turns ?? record.transcript_payload?.turns
    return Array.isArray(turns) && turns.some(t => typeof t.text === 'string' && t.text.trim().length > 0)
  }
  return false
}

/**
 * Get the timestamp for activity grouping.
 * Calls use sourcePayload.started_at; meetings use sourcePayload.starts_at.
 */
export function getActivityTimestamp(record) {
  if (!record) return null
  const payload = record.sourcePayload ?? record.payload
  if (record.sourceType === 'call' || record.source_type === 'call') return payload?.started_at || null
  if (record.sourceType === 'meeting' || record.source_type === 'meeting') return payload?.starts_at || null
  return null
}

/**
 * Get the person associated with a record.
 * Calls: rep_name (or rep_email if name is null)
 * Meetings: organizer_email (the organiser, not an attendee or salesperson)
 */
export function getPerson(record) {
  if (!record) return null
  const payload = record.sourcePayload ?? record.payload
  if (record.sourceType === 'call' || record.source_type === 'call') {
    return payload?.rep_name || payload?.rep_email || 'Unknown'
  }
  if (record.sourceType === 'meeting' || record.source_type === 'meeting') {
    return payload?.organizer_email || 'Unknown'
  }
  return 'Unknown'
}

/**
 * Get the person role label (call rep vs meeting organiser).
 */
export function getPersonRole(record) {
  if (!record) return ''
  const type = record.sourceType ?? record.source_type
  return type === 'call' ? 'Call rep' : 'Meeting organiser'
}

/**
 * Get the title for display.
 * Calls: no title in payload, use recordRef + rep_name
 * Meetings: sourcePayload.title
 */
export function getRecordTitle(record) {
  if (!record) return 'Untitled'
  const payload = record.sourcePayload ?? record.payload
  const ref = record.recordRef ?? record.record_ref
  if (record.sourceType === 'meeting' || record.source_type === 'meeting') {
    return payload?.title || 'Untitled meeting'
  }
  if (record.sourceType === 'call' || record.source_type === 'call') {
    const rep = payload?.rep_name || 'Unknown'
    return `${ref} — ${rep} call`
  }
  return 'Untitled'
}

/**
 * Get transcript text as displayable turns.
 * For calls: return the transcript as a single "turn".
 * For meetings: return the turns array as-is.
 */
export function getTranscriptTurns(record) {
  if (!record) return []
  const payload = record.sourcePayload ?? record.payload
  if (record.sourceType === 'call' || record.source_type === 'call') {
    const text = payload?.transcript
    if (!text || !text.trim()) return []
    return [{ speaker: 'Transcript', timecode: null, starts_at_seconds: null, text }]
  }
  if (record.sourceType === 'meeting' || record.source_type === 'meeting') {
    const turns = record.transcriptPayload?.turns ?? record.transcript_payload?.turns
    if (!Array.isArray(turns)) return []
    return turns
  }
  return []
}

/**
 * Get the unavailable reason for a meeting transcript.
 */
export function getUnavailableReason(record) {
  const type = record?.sourceType ?? record?.source_type
  if (!record || type !== 'meeting') return null
  return record.transcriptPayload?.unavailable_reason ?? record.transcript_payload?.unavailable_reason ?? null
}

/**
 * Get a display-safe filename slug from a string.
 * Removes path separators and dangerous characters.
 */
export function slugify(str) {
  return String(str || '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 80)
}
