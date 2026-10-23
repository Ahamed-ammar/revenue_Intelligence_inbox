import React, { useState } from 'react'
import { ArrowLeft, User, Clock, FileText, FileX, AlertTriangle, CheckCircle, RefreshCw, Shield } from 'lucide-react'
import { hasUsableTranscript, getTranscriptTurns, getUnavailableReason, getPerson, getActivityTimestamp, getRecordTitle, getPersonRole } from '../lib/normalize.js'
import { suggestRoutes, generateAnalysis, ROUTE_MAP } from '../lib/routes.js'

function DetailView({ record, onSetManualRoute, onResetManualRoute, onSetReviewState, onMarkAnalysisReviewed, onBack }) {
  if (!record) {
    return (
      <div className="detail-view">
        <button className="btn btn-ghost" onClick={onBack}><ArrowLeft size={16} /> Back to inbox</button>
        <p>No record selected.</p>
      </div>
    )
  }

  const analysis = generateAnalysis(record)
  const suggestedRoutes = suggestRoutes(record)
  const hasTranscript = hasUsableTranscript(record)
  const turns = getTranscriptTurns(record)
  const unavailableReason = getUnavailableReason(record)
  const person = getPerson(record)
  const personRole = getPersonRole(record)
  const timestamp = getActivityTimestamp(record)
  const title = getRecordTitle(record)

  const [selectedRoute, setSelectedRoute] = useState(record.manualRoute || '')

  const effectiveRoutes = record.manualRoute ? [record.manualRoute] : suggestedRoutes

  return (
    <div className="detail-view">
      <button className="btn btn-ghost back-btn" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" /> Back to inbox
      </button>

      <div className="detail-header">
        <div className="detail-header-left">
          <h2>{record.recordRef} — {title}</h2>
          <div className="detail-meta">
            <span className="meta-item">
              {record.sourceType === 'call' ? <Phone16 /> : <Video16 />}
              {record.sourceType === 'call' ? 'Call' : 'Meeting'}
            </span>
            <span className="meta-item"><User size={14} aria-hidden="true" /> {person} ({personRole})</span>
            <span className="meta-item"><Clock size={14} aria-hidden="true" /> {formatTimestamp(timestamp)}</span>
            <span className="meta-item">Revision: v{record.appliedRevision}</span>
          </div>
        </div>
        <div className="detail-header-right">
          <div className="freshness-indicator">
            <AnalysisFreshnessBadge freshness={record.analysisFreshness} />
          </div>
        </div>
      </div>

      <div className="detail-grid">
        {/* Left column: source metadata + transcript */}
        <div className="detail-col">
          <div className="card">
            <h3 className="card-title">Source metadata</h3>
            <table className="metadata-table">
              <tbody>
                {record.sourceType === 'call' ? (
                  <>
                    <MetadataRow label="Record ref" value={record.recordRef} />
                    <MetadataRow label="Source ID" value={record.sourceId} mono />
                    <MetadataRow label="External call ID" value={record.sourcePayload?.external_call_id} />
                    <MetadataRow label="Workspace" value={record.sourcePayload?.workspace_slug} />
                    <MetadataRow label="Rep name" value={record.sourcePayload?.rep_name} />
                    <MetadataRow label="Rep email" value={record.sourcePayload?.rep_email} />
                    <MetadataRow label="Direction" value={record.sourcePayload?.direction} />
                    <MetadataRow label="Duration (s)" value={record.sourcePayload?.duration_seconds} />
                    <MetadataRow label="Talk time (s)" value={record.sourcePayload?.talk_time_seconds} />
                    <MetadataRow label="Is connected" value={String(record.sourcePayload?.is_connected)} />
                    <MetadataRow label="Is conversation" value={String(record.sourcePayload?.is_conversation)} />
                    <MetadataRow label="Observed outcome" value={record.sourcePayload?.observed_outcome} />
                    <MetadataRow label="Campaign call" value={String(record.sourcePayload?.is_campaign_call)} />
                    <MetadataRow label="Summary status" value={record.sourcePayload?.summary_status} />
                  </>
                ) : (
                  <>
                    <MetadataRow label="Record ref" value={record.recordRef} />
                    <MetadataRow label="Source ID" value={record.sourceId} mono />
                    <MetadataRow label="Title" value={record.sourcePayload?.title} />
                    <MetadataRow label="Provider" value={record.sourcePayload?.provider} />
                    <MetadataRow label="Organizer email" value={record.sourcePayload?.organizer_email} />
                    <MetadataRow label="Attendee count" value={record.sourcePayload?.attendee_count} />
                    <MetadataRow label="Recording status" value={record.sourcePayload?.recording_status} />
                    <MetadataRow label="Recording detail" value={record.sourcePayload?.recording_detail} />
                    <MetadataRow label="Has transcript (source flag)" value={String(record.sourcePayload?.has_transcript)} />
                    <MetadataRow label="Has video" value={String(record.sourcePayload?.has_video)} />
                    <MetadataRow label="Duration (s)" value={record.sourcePayload?.duration_seconds} />
                    <MetadataRow label="Summary status" value={record.sourcePayload?.summary_status} />
                    <MetadataRow label="Redacted" value={String(record.sourcePayload?.redacted)} />
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3 className="card-title">
              {hasTranscript ? 'Transcript' : 'Transcript unavailable'}
            </h3>
            {hasTranscript ? (
              <div className="transcript-container">
                {turns.map((turn, i) => (
                  <div key={i} className="transcript-turn">
                    <div className="turn-header">
                      <span className="turn-speaker">{turn.speaker}</span>
                      {turn.timecode && <span className="turn-timecode">{turn.timecode}</span>}
                      {turn.turnNumber && <span className="turn-number">Turn {turn.turnNumber}</span>}
                    </div>
                    <p className="turn-text">{turn.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-transcript">
                <FileX size={24} aria-hidden="true" />
                <p>
                  {unavailableReason || 'No usable transcript text was supplied for this call.'}
                </p>
                <p className="no-transcript-note">
                  This record is tracked for intake. No fabricated analysis is assigned.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: analysis, routing, review */}
        <div className="detail-col">
          <div className="card">
            <h3 className="card-title">Analysis</h3>
            {analysis.hasTranscript ? (
              <>
                <div className="analysis-section">
                  <h4>Summary</h4>
                  <p>{analysis.summary}</p>
                </div>

                <div className="analysis-section">
                  <h4>Evidence passages</h4>
                  {analysis.evidence.length > 0 ? (
                    <ul className="evidence-list">
                      {analysis.evidence.map((ev, i) => (
                        <li key={i} className="evidence-item">
                          <div className="evidence-label">
                            <span className="evidence-tag">{ev.label}</span>
                            {ev.speaker && <span className="evidence-speaker">{ev.speaker}</span>}
                            {ev.timecode && <span className="evidence-timecode">{ev.timecode}</span>}
                            {ev.turnNumber && <span className="evidence-turn">Turn {ev.turnNumber}</span>}
                          </div>
                          {ev.quote ? (
                            <p className="evidence-quote">&ldquo;{ev.quote}&rdquo;</p>
                          ) : (
                            <p className="evidence-quote">&ldquo;{ev.text}&rdquo;</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No specific evidence passages were extracted by the rule-based system.</p>
                  )}
                </div>

                <div className="analysis-section">
                  <h4>What the evidence does not establish</h4>
                  <ul className="not-established-list">
                    {analysis.notEstablished.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="analysis-section">
                  <h4>Suggested next actions</h4>
                  <ul className="actions-list">
                    {analysis.nextActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>

                {analysis.owner && (
                  <div className="analysis-section">
                    <h4>Owner</h4>
                    <p>{analysis.owner}</p>
                  </div>
                )}

                <div className="analysis-section">
                  <h4>Confidence: <span className={`confidence-${analysis.confidence}`}>{analysis.confidence}</span></h4>
                  <p className="confidence-explanation">{analysis.confidenceExplanation}</p>
                </div>
              </>
            ) : (
              <div className="no-analysis">
                <AlertTriangle size={20} aria-hidden="true" />
                <p>{analysis.unavailableReason}</p>
                <p className="no-analysis-note">No substantive analysis can be produced without usable transcript text.</p>
              </div>
            )}
            <div className="analysis-disclaimer">
              <Shield size={14} aria-hidden="true" />
              <span>Analysis is rule-based and deterministic. No AI model was used.</span>
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">Routing</h3>

            <div className="routing-section">
              <h4>Suggested routes (automated)</h4>
              <div className="route-badges-lg">
                {suggestedRoutes.map(route => (
                  <span key={route} className="route-badge" style={{ backgroundColor: ROUTE_MAP[route]?.color || '#9ca3af' }}>
                    {ROUTE_MAP[route]?.label || route}
                  </span>
                ))}
              </div>
            </div>

            <div className="routing-section">
              <h4>
                Manual route override
                {record.manualRoute && <span className="badge-manual">Active</span>}
              </h4>
              <p className="routing-note">
                {record.manualRoute
                  ? `A manual route has been set: ${ROUTE_MAP[record.manualRoute]?.label || record.manualRoute}. This overrides the suggested route and survives source updates.`
                  : 'No manual override is set. The suggested route is active.'}
              </p>
              <div className="route-override-controls">
                <select
                  value={selectedRoute}
                  onChange={e => setSelectedRoute(e.target.value)}
                  aria-label="Select manual route"
                  className="route-select"
                >
                  <option value="">— Select a route —</option>
                  {Object.values(ROUTE_MAP).map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => selectedRoute && onSetManualRoute(record.identity, selectedRoute)}
                  disabled={!selectedRoute}
                >
                  Save manual route
                </button>
                {record.manualRoute && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      onResetManualRoute(record.identity)
                      setSelectedRoute('')
                    }}
                  >
                    Reset to suggested
                  </button>
                )}
              </div>
            </div>

            {record.manualRoute && (
              <div className="routing-section manual-info">
                <CheckCircle size={16} aria-hidden="true" />
                <p>Manual route is active and will be preserved when source updates arrive.</p>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="card-title">Review state</h3>
            <div className="review-controls">
              <label>
                <input
                  type="radio"
                  name="review-state"
                  value="pending"
                  checked={record.reviewState === 'pending'}
                  onChange={() => onSetReviewState(record.identity, 'pending')}
                />
                Pending
              </label>
              <label>
                <input
                  type="radio"
                  name="review-state"
                  value="reviewed"
                  checked={record.reviewState === 'reviewed'}
                  onChange={() => onSetReviewState(record.identity, 'reviewed')}
                />
                Reviewed
              </label>
              <label>
                <input
                  type="radio"
                  name="review-state"
                  value="attention"
                  checked={record.reviewState === 'attention'}
                  onChange={() => onSetReviewState(record.identity, 'attention')}
                />
                Needs attention
              </label>
            </div>
            {record.analysisFreshness === 'pending_review' && (
              <div className="stale-notice">
                <RefreshCw size={16} aria-hidden="true" />
                <span>The source text has changed since the last analysis. Review and mark as current.</span>
                <button className="btn btn-sm btn-primary" onClick={() => onMarkAnalysisReviewed(record.identity)}>
                  Mark as reviewed
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetadataRow({ label, value, mono }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className={mono ? 'mono' : ''}>{value === null || value === undefined ? 'null' : String(value)}</td>
    </tr>
  )
}

function AnalysisFreshnessBadge({ freshness }) {
  const config = {
    current: { label: 'Current', color: '#16a34a', icon: CheckCircle },
    pending_review: { label: 'Pending review', color: '#ea580c', icon: RefreshCw },
    stale: { label: 'Stale', color: '#dc2626', icon: AlertTriangle },
  }
  const cfg = config[freshness] || config.current
  const Icon = cfg.icon
  return (
    <span className="freshness-badge" style={{ color: cfg.color, borderColor: cfg.color }}>
      <Icon size={14} aria-hidden="true" /> {cfg.label}
    </span>
  )
}

function Phone16() {
  return <span aria-hidden="true">📞</span>
}

function Video16() {
  return <span aria-hidden="true">🎥</span>
}

function formatTimestamp(ts) {
  if (!ts) return '—'
  try {
    return new Date(ts).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    })
  } catch { return ts }
}

export default DetailView
