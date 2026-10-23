/**
 * Record identity utilities.
 * Identity is the pair (source_type, source_id).
 * Never key by name, record_ref, title, or array position.
 */

export function makeIdentity(sourceType, sourceId) {
  return `${sourceType}:${sourceId}`
}

export function parseIdentity(id) {
  const idx = id.indexOf(':')
  if (idx === -1) return { sourceType: '', sourceId: '' }
  return { sourceType: id.substring(0, idx), sourceId: id.substring(idx + 1) }
}

/**
 * Check that a record has valid identity fields.
 */
export function validateRecord(record) {
  const errors = []
  if (!record || typeof record !== 'object') {
    return ['Record is not an object']
  }
  if (!record.source_type || typeof record.source_type !== 'string') {
    errors.push('Missing or invalid source_type')
  }
  if (!record.source_id || typeof record.source_id !== 'string') {
    errors.push('Missing or invalid source_id')
  }
  if (!record.payload || typeof record.payload !== 'object') {
    errors.push('Missing or invalid payload')
  }
  return errors
}
