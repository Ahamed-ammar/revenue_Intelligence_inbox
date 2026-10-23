import React, { useState, useMemo } from 'react'
import { Phone, Video, FileText, FileX, Clock, AlertCircle, CheckCircle, HelpCircle, Info } from 'lucide-react'
import { hasUsableTranscript, getActivityTimestamp, getPerson, getPersonRole } from '../lib/normalize.js'
import { suggestRoutes, ROUTE_MAP } from '../lib/routes.js'

function Dashboard({ state, onSelectRecord }) {
  const [personFilter, setPersonFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showDefinitions, setShowDefinitions] = useState(false)

  const records = Object.values(state.records)

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (typeFilter !== 'all' && r.sourceType !== typeFilter) return false
      if (personFilter !== 'all') {
        if (getPerson(r) !== personFilter) return false
      }
      return true
    })
  }, [records, personFilter, typeFilter])

  // Collect unique persons
  const persons = useMemo(() => {
    const set = new Map()
    records.forEach(r => {
      const p = getPerson(r)
      set.set(p, (set.get(p) || 0) + 1)
    })
    return Array.from(set.entries()).sort((a, b) => b[1] - a[1])
  }, [records])

  // Metrics
  const totalRecords = filteredRecords.length
  const calls = filteredRecords.filter(r => r.sourceType === 'call').length
  const meetings = filteredRecords.filter(r => r.sourceType === 'meeting').length
  const withTranscript = filteredRecords.filter(r => hasUsableTranscript(r)).length
  const transcriptCoverage = totalRecords > 0 ? Math.round((withTranscript / totalRecords) * 100) : 0

  const reviewStates = useMemo(() => {
    const states = { pending: 0, reviewed: 0, attention: 0 }
    filteredRecords.forEach(r => {
      states[r.reviewState] = (states[r.reviewState] || 0) + 1
    })
    return states
  }, [filteredRecords])

  const routeCounts = useMemo(() => {
    const counts = {}
    filteredRecords.forEach(r => {
      const routes = r.manualRoute ? [r.manualRoute] : suggestRoutes(r)
      routes.forEach(route => {
        counts[route] = (counts[route] || 0) + 1
      })
    })
    return counts
  }, [filteredRecords])

  // Activity by person
  const activityByPerson = useMemo(() => {
    const map = new Map()
    filteredRecords.forEach(r => {
      const person = getPerson(r)
      const role = getPersonRole(r)
      if (!map.has(person)) {
        map.set(person, { name: person, role, calls: 0, meetings: 0, withTranscript: 0 })
      }
      const entry = map.get(person)
      if (r.sourceType === 'call') entry.calls++
      else entry.meetings++
      if (hasUsableTranscript(r)) {
        entry.withTranscript++
      }
    })
    return Array.from(map.values()).sort((a, b) => (b.calls + b.meetings) - (a.calls + a.meetings))
  }, [filteredRecords])

  // All activity is on Aug 21, 2026 in Asia/Kolkata
  const activityDate = '2026-08-21'

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>Dashboard</h2>
        <button className="btn btn-ghost" onClick={() => setShowDefinitions(!showDefinitions)} aria-expanded={showDefinitions}>
          <Info size={16} aria-hidden="true" /> Metric definitions
        </button>
      </div>

      {showDefinitions && <DefinitionsPanel />}

      <div className="filter-bar">
        <label className="filter-item">
          <span className="filter-label">Person</span>
          <select value={personFilter} onChange={e => setPersonFilter(e.target.value)} aria-label="Filter by person">
            <option value="all">All ({records.length})</option>
            {persons.map(([name, count]) => (
              <option key={name} value={name}>{name} ({count})</option>
            ))}
          </select>
        </label>
        <label className="filter-item">
          <span className="filter-label">Source type</span>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} aria-label="Filter by source type">
            <option value="all">All types</option>
            <option value="call">Calls</option>
            <option value="meeting">Meetings</option>
          </select>
        </label>
      </div>

      <div className="metric-cards">
        <MetricCard
          icon={FileText}
          label="Total records"
          value={totalRecords}
          subtitle="Unique (source_type, source_id)"
          color="#4f46e5"
        />
        <MetricCard
          icon={Phone}
          label="Calls"
          value={calls}
          subtitle="Source type: call"
          color="#0891b2"
        />
        <MetricCard
          icon={Video}
          label="Meetings"
          value={meetings}
          subtitle="Source type: meeting"
          color="#7c3aed"
        />
        <MetricCard
          icon={FileText}
          label="Transcript coverage"
          value={`${withTranscript}/${totalRecords}`}
          subtitle={`${transcriptCoverage}% of records have usable text`}
          color={transcriptCoverage > 40 ? '#16a34a' : '#ea580c'}
        />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 className="card-title">Review states</h3>
          <div className="review-state-row">
            <ReviewStateBadge state="pending" count={reviewStates.pending} />
            <ReviewStateBadge state="reviewed" count={reviewStates.reviewed} />
            <ReviewStateBadge state="attention" count={reviewStates.attention} />
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Records by route</h3>
          <div className="route-list">
            {Object.entries(routeCounts).sort((a, b) => b[1] - a[1]).map(([route, count]) => (
              <div key={route} className="route-count-row">
                <span className="route-badge" style={{ backgroundColor: ROUTE_MAP[route]?.color || '#9ca3af' }}>
                  {ROUTE_MAP[route]?.label || route}
                </span>
                <span className="route-count">{count}</span>
              </div>
            ))}
          </div>
          {Object.values(routeCounts).reduce((a, b) => a + b, 0) > totalRecords && (
            <p className="card-note">
              <Info size={14} aria-hidden="true" /> Route count exceeds record count because some records have multiple routes.
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Activity by person — {activityDate} (Asia/Kolkata)</h3>
          <span className="card-note-inline">Single-day sample. A date chart alone provides limited insight.</span>
        </div>
        <table className="activity-table">
          <thead>
            <tr>
              <th scope="col">Person</th>
              <th scope="col">Role</th>
              <th scope="col" className="num-col">Calls</th>
              <th scope="col" className="num-col">Meetings</th>
              <th scope="col" className="num-col">Total</th>
              <th scope="col" className="num-col">With transcript</th>
            </tr>
          </thead>
          <tbody>
            {activityByPerson.map(person => (
              <tr key={person.name}>
                <td>{person.name}</td>
                <td><span className="role-tag">{person.role}</span></td>
                <td className="num-col">{person.calls}</td>
                <td className="num-col">{person.meetings}</td>
                <td className="num-col"><strong>{person.calls + person.meetings}</strong></td>
                <td className="num-col">{person.withTranscript}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, subtitle, color }) {
  return (
    <div className="metric-card">
      <div className="metric-icon" style={{ color }}>
        <Icon size={20} aria-hidden="true" />
      </div>
      <div className="metric-body">
        <span className="metric-value">{value}</span>
        <span className="metric-label">{label}</span>
        <span className="metric-subtitle">{subtitle}</span>
      </div>
    </div>
  )
}

function ReviewStateBadge({ state, count }) {
  const config = {
    pending: { label: 'Awaiting review', icon: Clock, color: '#ea580c' },
    reviewed: { label: 'Reviewed', icon: CheckCircle, color: '#16a34a' },
    attention: { label: 'Needs attention', icon: AlertCircle, color: '#dc2626' },
  }
  const cfg = config[state] || config.pending
  const Icon = cfg.icon
  return (
    <div className="review-badge" style={{ borderColor: cfg.color }}>
      <Icon size={16} style={{ color: cfg.color }} aria-hidden="true" />
      <span style={{ color: cfg.color }}>{cfg.label}</span>
      <strong>{count}</strong>
    </div>
  )
}

function DefinitionsPanel() {
  return (
    <div className="definitions-panel" role="region" aria-label="Metric definitions">
      <h3>Metric definitions and denominators</h3>
      <dl className="definitions-list">
        <dt>Total records</dt>
        <dd>Count of distinct (source_type, source_id) pairs after applying revisions. A repeated import does not increase this count.</dd>
        <dt>Calls</dt>
        <dd>Records where source_type = "call".</dd>
        <dt>Meetings</dt>
        <dd>Records where source_type = "meeting".</dd>
        <dt>Transcript coverage</dt>
        <dd>Numerator: records with usable supplied transcript text (non-blank call transcript or at least one non-blank meeting turn). Denominator: all unique source records in the current filter. 17 initially, 18 after the update batch.</dd>
        <dt>Review states</dt>
        <dd><strong>Pending</strong>: no human review action taken. <strong>Reviewed</strong>: a manager has set a manual route or marked reviewed. <strong>Attention</strong>: flagged for special attention.</dd>
        <dt>Route counts</dt>
        <dd>Count of records assigned each route. A record can have multiple routes, so the sum of route counts may exceed total records. Manual overrides are used when present.</dd>
        <dt>Activity by person</dt>
        <dd>Calls are grouped by rep_name (the call representative). Meetings are grouped by organizer_email (the meeting organiser). An organiser is not automatically a salesperson or meeting attendee. All activity falls on 21 August 2026 in Asia/Kolkata.</dd>
        <dt>Source-reported connection rate</dt>
        <dd>Not shown as a headline metric. Calls with is_connected=true divided by calls with non-null is_connected. This is a stored classification, not independently verified.</dd>
      </dl>
    </div>
  )
}

export default Dashboard
