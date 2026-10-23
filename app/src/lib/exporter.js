/**
 * Export logic: generates JSON, CSV, and ZIP archive with manifest.
 */
import { slugify } from './normalize.js'
import { suggestRoutes, generateAnalysis } from './routes.js'

/**
 * Build a flat array of export-ready record objects.
 */
export function buildExportRecords(state) {
  const records = Object.values(state.records)
  return records.map(r => {
    const analysis = generateAnalysis(r)
    const suggestedRoutes = suggestRoutes(r)
    const effectiveRoute = r.manualRoute || (suggestedRoutes.length > 0 ? suggestedRoutes.join(';') : 'human_review')
    return {
      source_type: r.sourceType,
      source_id: r.sourceId,
      record_ref: r.recordRef,
      applied_revision: r.appliedRevision,
      title: r.sourceType === 'meeting' ? r.sourcePayload?.title : `${r.recordRef || ''} — ${r.sourcePayload?.rep_name || 'Unknown'}`,
      person: r.sourceType === 'call' ? (r.sourcePayload?.rep_name || r.sourcePayload?.rep_email || 'Unknown') : (r.sourcePayload?.organizer_email || 'Unknown'),
      has_transcript: analysis?.hasTranscript || false,
      suggested_routes: suggestedRoutes,
      effective_route: effectiveRoute,
      manual_route: r.manualRoute || null,
      is_manually_corrected: r.manualRoute !== null,
      review_state: r.reviewState,
      analysis_freshness: r.analysisFreshness,
      summary: analysis?.summary || '',
      confidence: analysis?.confidence || 'low',
      imported_at: r.importedAt,
    }
  })
}

/**
 * Generate JSON export as a string.
 */
export function exportJSON(state) {
  const records = buildExportRecords(state)
  const exportData = {
    exported_at: new Date().toISOString(),
    total_records: records.length,
    records,
  }
  return JSON.stringify(exportData, null, 2)
}

/**
 * Escape a CSV field.
 */
function csvEscape(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

/**
 * Generate CSV export as a string.
 */
export function exportCSV(state) {
  const records = buildExportRecords(state)
  const headers = [
    'source_type', 'source_id', 'record_ref', 'applied_revision',
    'title', 'person', 'has_transcript', 'suggested_routes',
    'effective_route', 'manual_route', 'is_manually_corrected',
    'review_state', 'analysis_freshness', 'summary', 'confidence',
  ]

  const lines = [headers.map(csvEscape).join(',')]
  for (const r of records) {
    const row = [
      r.source_type, r.source_id, r.record_ref, r.applied_revision,
      r.title, r.person, r.has_transcript,
      r.suggested_routes.join(';'), r.effective_route,
      r.manual_route, r.is_manually_corrected,
      r.review_state, r.analysis_freshness, r.summary, r.confidence,
    ]
    lines.push(row.map(csvEscape).join(','))
  }
  return lines.join('\n')
}

/**
 * Build the manifest object for the ZIP archive.
 */
export function buildManifest(state) {
  const records = Object.values(state.records)
  const entries = []

  for (const r of records) {
    const analysis = generateAnalysis(r)
    const suggestedRoutes = suggestRoutes(r)
    const folderName = `${slugify(r.sourceType)}_${slugify(r.sourceId)}`
    const sourcePath = `exports/records/${folderName}/source.json`
    const analysisPath = `exports/records/${folderName}/analysis.json`

    entries.push({
      source_type: r.sourceType,
      source_id: r.sourceId,
      record_ref: r.recordRef,
      applied_source_revision: r.appliedRevision,
      routes: r.manualRoute ? [r.manualRoute] : suggestedRoutes,
      is_manually_corrected: r.manualRoute !== null,
      manual_route: r.manualRoute || null,
      output_paths: [sourcePath, analysisPath],
      processing_state: r.reviewState,
      analysis_freshness: r.analysisFreshness,
      has_transcript: analysis?.hasTranscript || false,
      confidence: analysis?.confidence || 'low',
    })
  }

  return {
    exported_at: new Date().toISOString(),
    total_records: entries.length,
    records: entries,
  }
}

/**
 * Build the full set of files for ZIP export.
 * Returns an array of { path, content } objects.
 */
export function buildExportFiles(state) {
  const files = []
  const records = Object.values(state.records)

  // Manifest
  const manifest = buildManifest(state)
  files.push({
    path: 'exports/manifest.json',
    content: JSON.stringify(manifest, null, 2),
  })

  // Per-record files
  for (const r of records) {
    const folderName = `${slugify(r.sourceType)}_${slugify(r.sourceId)}`
    const analysis = generateAnalysis(r)

    files.push({
      path: `exports/records/${folderName}/source.json`,
      content: JSON.stringify({
        source_type: r.sourceType,
        source_id: r.sourceId,
        record_ref: r.recordRef,
        applied_revision: r.appliedRevision,
        payload: r.sourcePayload,
        transcript_payload: r.transcriptPayload,
      }, null, 2),
    })

    files.push({
      path: `exports/records/${folderName}/analysis.json`,
      content: JSON.stringify({
        source_type: r.sourceType,
        source_id: r.sourceId,
        record_ref: r.recordRef,
        ...analysis,
        manual_route: r.manualRoute,
        review_state: r.reviewState,
        analysis_freshness: r.analysisFreshness,
      }, null, 2),
    })
  }

  // README in export
  files.push({
    path: 'exports/README.md',
    content: buildExportReadme(),
  })

  return files
}

function buildExportReadme() {
  return `# Revenue Intelligence Inbox — Export Archive

## Structure

- \`manifest.json\` — Machine-readable manifest listing all source records, their routes, revisions, and review states.
- \`records/<source_type>_<source_id>/source.json\` — The raw source payload and transcript payload for each record.
- \`records/<source_type>_<source_id>/analysis.json\` — The generated analysis for each record (rule-based, deterministic).

## Manifest Fields

| Field | Description |
| --- | --- |
| source_type | "call" or "meeting" |
| source_id | The unique source identifier |
| record_ref | Short reading reference (e.g. M07, C01) |
| applied_source_revision | The latest revision applied to this record |
| routes | Assigned route(s) — manual override if present, otherwise suggested |
| is_manually_corrected | true if a manager manually set the route |
| manual_route | The manually chosen route, or null |
| output_paths | Relative paths to this record's output files |
| processing_state | pending, reviewed, or attention |
| analysis_freshness | current, pending_review, or stale |
| has_transcript | Whether usable transcript text is available |
| confidence | Analysis confidence level (low, medium) |

## Analysis

All analysis is rule-based and deterministic. No LLM or AI model was used.
See the application README for the routing taxonomy and rules.
`
}

/**
 * Trigger a browser download of a text file.
 */
export function downloadFile(filename, content, mimeType = 'application/json') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
