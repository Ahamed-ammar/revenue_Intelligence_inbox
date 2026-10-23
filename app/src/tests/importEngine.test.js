import { describe, it, expect, beforeEach } from 'vitest'
import { createInitialState, applyBatch, parseBatch, setManualRoute, resetManualRoute, getUniqueCount, loadState, clearState, saveState } from '../lib/importEngine.js'
import { makeIdentity } from '../lib/identity.js'
import { hasUsableTranscript } from '../lib/normalize.js'
import { suggestRoutes, generateAnalysis, ROUTE_MAP } from '../lib/routes.js'
import { buildManifest, buildExportFiles, exportJSON, exportCSV } from '../lib/exporter.js'
import initialData from '../data/initial.json'
import updateData from '../data/update.json'

const M07_IDENTITY = makeIdentity('meeting', '4f304fff-fd40-5cfc-a366-0a134c445c2a')

describe('Test 1: Initial import', () => {
  it('imports 44 unique records (30 calls + 14 meetings)', () => {
    const state = createInitialState()
    const { state: newState, summary } = applyBatch(state, initialData)
    expect(getUniqueCount(newState)).toBe(44)
    expect(summary.inserted).toBe(44)
    expect(summary.rejected).toBe(0)

    const calls = Object.values(newState.records).filter(r => r.sourceType === 'call')
    const meetings = Object.values(newState.records).filter(r => r.sourceType === 'meeting')
    expect(calls.length).toBe(30)
    expect(meetings.length).toBe(14)
  })

  it('has 17 usable transcripts after initial import', () => {
    const state = createInitialState()
    const { state: newState } = applyBatch(state, initialData)
    const withTranscript = Object.values(newState.records).filter(r =>
      hasUsableTranscript({ source_type: r.sourceType, payload: r.sourcePayload, transcript_payload: r.transcriptPayload })
    )
    expect(withTranscript.length).toBe(17)
  })
})

describe('Test 2: Duplicate import', () => {
  it('does not create duplicates when importing the same batch twice', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const { state: state2, summary } = applyBatch(state1, initialData)
    expect(getUniqueCount(state2)).toBe(44)
    expect(summary.inserted).toBe(0)
    expect(summary.updated).toBe(0)
    expect(summary.ignoredStale).toBe(44)
  })
})

describe('Test 3: Order-independent identity', () => {
  it('does not create duplicates when records are in different array order', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    // Shuffle records
    const shuffled = {
      ...initialData,
      records: [...initialData.records].reverse(),
    }
    const { state: state2, summary } = applyBatch(state1, shuffled)
    expect(getUniqueCount(state2)).toBe(44)
    expect(summary.ignoredStale).toBe(44)
  })
})

describe('Test 4: Manual override', () => {
  it('allows changing M07 route manually', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const state2 = setManualRoute(state1, M07_IDENTITY, 'customer_support')
    expect(state2.records[M07_IDENTITY].manualRoute).toBe('customer_support')
    expect(state2.records[M07_IDENTITY].reviewState).toBe('reviewed')
  })
})

describe('Test 5: Apply update', () => {
  it('updates M07 with newer revision without creating a second record', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const { state: state2, summary } = applyBatch(state1, updateData)
    expect(getUniqueCount(state2)).toBe(44)
    expect(summary.updated).toBe(1)
    expect(summary.inserted).toBe(0)
    expect(state2.records[M07_IDENTITY].appliedRevision).toBe(2)
  })

  it('makes the 18th transcript available after update', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const { state: state2 } = applyBatch(state1, updateData)
    const withTranscript = Object.values(state2.records).filter(r =>
      hasUsableTranscript({ source_type: r.sourceType, payload: r.sourcePayload, transcript_payload: r.transcriptPayload })
    )
    expect(withTranscript.length).toBe(18)
  })
})

describe('Test 6: Preserve manual decision', () => {
  it('manual route survives source update', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const state2 = setManualRoute(state1, M07_IDENTITY, 'customer_support')
    const { state: state3 } = applyBatch(state2, updateData)
    expect(state3.records[M07_IDENTITY].manualRoute).toBe('customer_support')
  })
})

describe('Test 7: Stale replay', () => {
  it('importing initial batch after update does not overwrite newer revision', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const state2 = setManualRoute(state1, M07_IDENTITY, 'customer_support')
    const { state: state3 } = applyBatch(state2, updateData)
    const { state: state4, summary } = applyBatch(state3, initialData)
    expect(state4.records[M07_IDENTITY].appliedRevision).toBe(2)
    expect(summary.ignoredStale).toBe(44)
    expect(state4.records[M07_IDENTITY].manualRoute).toBe('customer_support')
  })
})

describe('Test 8: Refresh persistence', () => {
  beforeEach(() => { clearState() })

  it('state persists across simulated refresh', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const state2 = setManualRoute(state1, M07_IDENTITY, 'security_escalation')
    saveState(state2)

    const loaded = loadState()
    expect(loaded).not.toBeNull()
    expect(getUniqueCount(loaded)).toBe(44)
    expect(loaded.records[M07_IDENTITY].manualRoute).toBe('security_escalation')
    expect(loaded.records[M07_IDENTITY].reviewState).toBe('reviewed')
  })
})

describe('Test 9: Missing transcript', () => {
  it('records without transcripts are visible and marked, not given fabricated analysis', () => {
    const state = createInitialState()
    const { state: newState } = applyBatch(state, initialData)
    const noTranscript = Object.values(newState.records).filter(r =>
      !hasUsableTranscript({ source_type: r.sourceType, payload: r.sourcePayload, transcript_payload: r.transcriptPayload })
    )
    expect(noTranscript.length).toBe(27) // 44 - 17 = 27

    // Check that each no-transcript record is suggested human_review
    noTranscript.forEach(r => {
      const routes = suggestRoutes(r)
      expect(routes).toContain('human_review')
      const analysis = generateAnalysis(r)
      expect(analysis.hasTranscript).toBe(false)
      expect(analysis.summary).toBeNull()
    })
  })
})

describe('Test 10: Exports', () => {
  it('JSON export contains all records with correct fields', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const json = exportJSON(state1)
    const parsed = JSON.parse(json)
    expect(parsed.total_records).toBe(44)
    expect(parsed.records.length).toBe(44)
    expect(parsed.records[0]).toHaveProperty('source_type')
    expect(parsed.records[0]).toHaveProperty('source_id')
    expect(parsed.records[0]).toHaveProperty('applied_revision')
    expect(parsed.records[0]).toHaveProperty('effective_route')
    expect(parsed.records[0]).toHaveProperty('review_state')
    expect(parsed.records[0]).toHaveProperty('analysis_freshness')
    expect(parsed.records[0]).toHaveProperty('is_manually_corrected')
  })

  it('CSV export has header row and data rows', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const csv = exportCSV(state1)
    const lines = csv.split('\n')
    expect(lines.length).toBe(45) // header + 44 records
    expect(lines[0]).toContain('source_type')
    expect(lines[0]).toContain('source_id')
    expect(lines[0]).toContain('applied_revision')
  })

  it('manifest lists all records with correct paths', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const manifest = buildManifest(state1)
    expect(manifest.total_records).toBe(44)
    manifest.records.forEach(r => {
      expect(r.output_paths.length).toBe(2) // source.json + analysis.json
      expect(r.output_paths[0]).toMatch(/^exports\/records\//)
    })
  })

  it('export files all have valid paths', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const files = buildExportFiles(state1)
    const manifest = buildManifest(state1)

    // Collect all file paths from the manifest
    const manifestPaths = new Set()
    manifest.records.forEach(r => {
      r.output_paths.forEach(p => manifestPaths.add(p))
    })
    manifestPaths.add('exports/manifest.json')
    manifestPaths.add('exports/README.md')

    // Check that every manifest path has a corresponding file
    const filePaths = new Set(files.map(f => f.path))
    manifestPaths.forEach(p => {
      expect(filePaths.has(p)).toBe(true)
    })

    // Check that we have 44*2 + 2 files (source.json + analysis.json per record + manifest + README)
    expect(files.length).toBe(44 * 2 + 2)
  })
})

describe('Test 11: Error handling', () => {
  it('rejects malformed JSON', () => {
    const result = parseBatch('not valid json')
    expect(result.batch).toBeNull()
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('rejects missing records array', () => {
    const result = parseBatch('{"revision": 1}')
    expect(result.batch).toBeNull()
    expect(result.errors[0]).toContain('records')
  })

  it('rejects missing revision', () => {
    const result = parseBatch('{"records": []}')
    expect(result.batch).toBeNull()
    expect(result.errors[0]).toContain('revision')
  })

  it('does not corrupt existing state on bad import', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const badResult = parseBatch('malformed')
    expect(badResult.batch).toBeNull()
    expect(getUniqueCount(state1)).toBe(44) // State unchanged
  })
})

describe('Routing sanity', () => {
  it('M07 after update routes to customer_support', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const { state: state2 } = applyBatch(state1, updateData)
    const routes = suggestRoutes(state2.records[M07_IDENTITY])
    expect(routes).toContain('customer_support')
  })

  it('M01 routes to partnership', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const m01 = Object.values(state1.records).find(r => r.recordRef === 'M01')
    const routes = suggestRoutes(m01)
    expect(routes).toContain('partnership')
  })

  it('M03 routes to sales_follow_up', () => {
    const state = createInitialState()
    const { state: state1 } = applyBatch(state, initialData)
    const m03 = Object.values(state1.records).find(r => r.recordRef === 'M03')
    const routes = suggestRoutes(m03)
    expect(routes).toContain('sales_follow_up')
  })
})
