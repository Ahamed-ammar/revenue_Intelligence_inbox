import React from 'react'
import { Briefcase, AlertCircle, ArrowRight, Shield } from 'lucide-react'
import { MANAGER_BRIEF } from '../lib/managerBrief.js'

function ManagerBrief({ state, onSelectRecord }) {
  const records = Object.values(state.records)
  const recordByRef = {}
  records.forEach(r => {
    if (r.recordRef) recordByRef[r.recordRef] = r
  })

  return (
    <div className="manager-brief">
      <div className="page-header">
        <h2><Briefcase size={24} aria-hidden="true" /> Manager Brief</h2>
        <span className="brief-date">{MANAGER_BRIEF.date} ({MANAGER_BRIEF.timezone})</span>
      </div>

      <div className="brief-disclaimer">
        <Shield size={16} aria-hidden="true" />
        <p>
          This brief is pre-generated and rule-based. No AI model was used.
          It covers all 18 conversations with usable text after applying the update batch.
          This is a single-day selected sample, not a representative team performance review.
        </p>
      </div>

      <div className="brief-summary">
        <p>{MANAGER_BRIEF.summary}</p>
      </div>

      {MANAGER_BRIEF.sections.map((section, si) => (
        <div key={si} className="brief-section">
          <h3>{section.title}</h3>
          {section.items.map((item, ii) => {
            const record = item.ref ? recordByRef[item.ref] : null
            return (
              <div key={ii} className="brief-item">
                {item.ref && (
                  <div className="brief-item-header">
                    <strong>{item.ref}</strong>
                    {item.title && <span className="brief-item-title">{item.title}</span>}
                    {item.route && <span className="brief-route">{item.route}</span>}
                  </div>
                )}
                {item.finding && <p className="brief-finding">{item.finding}</p>}
                {item.evidence && (
                  <div className="brief-evidence">
                    <span className="evidence-label-text">Evidence:</span>
                    <blockquote>{item.evidence}</blockquote>
                  </div>
                )}
                {item.action && (
                  <div className="brief-action">
                    <ArrowRight size={14} aria-hidden="true" />
                    <span>{item.action}</span>
                  </div>
                )}
                {item.uncertainty && (
                  <div className="brief-uncertainty">
                    <AlertCircle size={14} aria-hidden="true" />
                    <span>{item.uncertainty}</span>
                  </div>
                )}
                {record && (
                  <button
                    className="btn btn-ghost btn-sm brief-link"
                    onClick={() => onSelectRecord(record.identity)}
                  >
                    View source record →
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default ManagerBrief
