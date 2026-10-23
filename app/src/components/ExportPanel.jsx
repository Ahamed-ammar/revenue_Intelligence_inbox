import React from 'react'
import { Download, FileJson, FileSpreadsheet, Archive, Info } from 'lucide-react'
import { exportJSON, exportCSV, buildManifest, buildExportFiles, downloadFile } from '../lib/exporter.js'

function ExportPanel({ state }) {
  const records = Object.values(state.records)

  if (records.length === 0) {
    return (
      <div className="export-panel">
        <h2>Export</h2>
        <p>No records to export. Import data first.</p>
      </div>
    )
  }

  const manifest = buildManifest(state)

  const handleExportJSON = () => {
    const content = exportJSON(state)
    downloadFile('revenue-inbox-export.json', content, 'application/json')
  }

  const handleExportCSV = () => {
    const content = exportCSV(state)
    downloadFile('revenue-inbox-export.csv', content, 'text/csv')
  }

  const handleExportZIP = async () => {
    // Dynamically import JSZip
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    const files = buildExportFiles(state)
    for (const file of files) {
      zip.file(file.path, file.content)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'revenue-inbox-export.zip'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="export-panel">
      <div className="page-header">
        <h2>Export</h2>
      </div>

      <div className="export-section">
        <h3>Download Options</h3>
        <div className="export-buttons">
          <button className="btn btn-primary" onClick={handleExportJSON}>
            <FileJson size={18} aria-hidden="true" /> Export JSON
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <FileSpreadsheet size={18} aria-hidden="true" /> Export CSV
          </button>
          <button className="btn btn-success" onClick={handleExportZIP}>
            <Archive size={18} aria-hidden="true" /> Export ZIP Archive
          </button>
        </div>
        <p className="export-note">
          The ZIP archive contains a manifest.json, per-record source.json and analysis.json files,
          and a README explaining the structure. Every path in the manifest points to an actual file in the archive.
        </p>
      </div>

      <div className="export-section">
        <h3>Manifest Preview</h3>
        <p className="section-description">
          Showing {manifest.total_records} records. Each entry includes source type, source ID, applied revision,
          routes, output paths, processing state, and manual-override flag.
        </p>
        <div className="manifest-preview">
          <table className="manifest-table">
            <thead>
              <tr>
                <th scope="col">Source Type</th>
                <th scope="col">Source ID</th>
                <th scope="col">Record Ref</th>
                <th scope="col">Revision</th>
                <th scope="col">Routes</th>
                <th scope="col">Manual</th>
                <th scope="col">State</th>
                <th scope="col">Freshness</th>
                <th scope="col">Transcript</th>
              </tr>
            </thead>
            <tbody>
              {manifest.records.map((r, i) => (
                <tr key={i}>
                  <td>{r.source_type}</td>
                  <td className="mono small">{r.source_id.substring(0, 12)}...</td>
                  <td>{r.record_ref}</td>
                  <td>v{r.applied_source_revision}</td>
                  <td>{r.routes.join(', ')}</td>
                  <td>{r.is_manually_corrected ? 'Yes' : 'No'}</td>
                  <td>{r.processing_state}</td>
                  <td>{r.analysis_freshness}</td>
                  <td>{r.has_transcript ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="export-section">
        <h3>Output Structure</h3>
        <pre className="structure-preview">
{`exports/
├── manifest.json
├── README.md
└── records/
    ├── call_<source_id>/
    │   ├── source.json
    │   └── analysis.json
    ├── meeting_<source_id>/
    │   ├── source.json
    │   └── analysis.json
    └── ... (44 records total)`}
        </pre>
      </div>
    </div>
  )
}

export default ExportPanel
