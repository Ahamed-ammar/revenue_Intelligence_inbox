import React, { useRef } from 'react'
import { Upload, RotateCcw, Play, FileDown, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { getAllRecords, getUniqueCount } from '../lib/importEngine.js'
import { hasUsableTranscript } from '../lib/normalize.js'

function ImportPanel({ state, onLoadInitial, onApplyUpdate, onLoadAll, onFileImport, onReset }) {
  const fileInputRef = useRef(null)

  const records = getAllRecords(state)
  const uniqueCount = getUniqueCount(state)
  const transcriptCount = records.filter(r => hasUsableTranscript(r)).length

  const importLog = state.importLog || []

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      onFileImport(file)
      e.target.value = '' // Reset for re-import
    }
  }

  return (
    <div className="import-panel">
      <div className="page-header">
        <h2>Import / Demo Replay</h2>
      </div>

      <div className="import-section">
        <h3>Demo Load Controls</h3>
        <p className="section-description">
          Use these buttons to replay the import sequence. The initial batch contains 44 records (30 calls + 14 meetings) with 17 usable transcripts. The update batch adds an 18th transcript to M07.
        </p>
        <div className="demo-controls">
          <button className="btn btn-primary" onClick={onLoadInitial}>
            <Play size={16} aria-hidden="true" /> Load Initial Batch
          </button>
          <button className="btn btn-secondary" onClick={onApplyUpdate}>
            <FileDown size={16} aria-hidden="true" /> Apply Update Batch
          </button>
          <button className="btn btn-success" onClick={onLoadAll}>
            <CheckCircle size={16} aria-hidden="true" /> Load Both (Demo State)
          </button>
        </div>
      </div>

      <div className="import-section">
        <h3>Import from File</h3>
        <p className="section-description">
          Import the supplied JSON files (01_initial.json, 02_update.json) or any valid batch file.
        </p>
        <div className="file-import-area">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            aria-label="Import JSON file"
            id="file-input"
            className="file-input"
          />
          <label htmlFor="file-input" className="file-input-label">
            <Upload size={20} aria-hidden="true" />
            <span>Choose JSON file to import</span>
          </label>
        </div>
        <p className="file-note">
          The file must have a "records" array and a numeric "revision" field. Malformed files will be rejected with an error message.
        </p>
      </div>

      <div className="import-section">
        <h3>Reset</h3>
        <p className="section-description">
          Clear all data and start fresh. This will remove all imported records, manual routes, and review states from browser storage.
        </p>
        <button className="btn btn-danger" onClick={onReset}>
          <RotateCcw size={16} aria-hidden="true" /> Reset All Data
        </button>
      </div>

      <div className="import-section">
        <h3>Current State</h3>
        <div className="state-cards">
          <div className="state-card">
            <span className="state-value">{uniqueCount}</span>
            <span className="state-label">Unique records</span>
          </div>
          <div className="state-card">
            <span className="state-value">{transcriptCount}</span>
            <span className="state-label">Usable transcripts</span>
          </div>
          <div className="state-card">
            <span className="state-value">{importLog.length}</span>
            <span className="state-label">Import operations</span>
          </div>
        </div>
      </div>

      {importLog.length > 0 && (
        <div className="import-section">
          <h3>Import History</h3>
          <table className="import-log-table">
            <thead>
              <tr>
                <th scope="col">Batch ID</th>
                <th scope="col">Revision</th>
                <th scope="col">Inserted</th>
                <th scope="col">Updated</th>
                <th scope="col">Ignored (stale)</th>
                <th scope="col">Rejected</th>
                <th scope="col">Imported at</th>
              </tr>
            </thead>
            <tbody>
              {[...importLog].reverse().map((log, i) => (
                <tr key={i}>
                  <td>{log.batchId}</td>
                  <td>v{log.revision}</td>
                  <td className="num-col">{log.inserted}</td>
                  <td className="num-col">{log.updated}</td>
                  <td className="num-col">{log.ignoredStale}</td>
                  <td className="num-col">{log.rejected}</td>
                  <td>{new Date(log.importedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="import-section replay-guide">
        <h3>Replay Steps (for testing)</h3>
        <ol className="replay-steps">
          <li>Click <strong>Load Initial Batch</strong> — 44 unique records appear, 17 with transcripts.</li>
          <li>Click <strong>Load Initial Batch</strong> again — count stays at 44, no duplicates.</li>
          <li>Go to Inbox, open <strong>M07</strong> (Willowfield Trust), change its route manually.</li>
          <li>Return here and click <strong>Apply Update Batch</strong> — M07 gets updated transcript (18th), manual route survives.</li>
          <li>Click <strong>Load Initial Batch</strong> again — M07's newer revision is not overwritten.</li>
          <li>Refresh the browser — all records, routes, and review states persist.</li>
        </ol>
      </div>
    </div>
  )
}

export default ImportPanel
