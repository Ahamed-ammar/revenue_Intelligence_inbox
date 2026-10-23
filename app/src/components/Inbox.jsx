import React, { useState, useMemo } from 'react'
import { Search, Phone, Video, FileText, FileX } from 'lucide-react'
import { hasUsableTranscript, getPerson, getActivityTimestamp, getRecordTitle } from '../lib/normalize.js'
import { suggestRoutes, ROUTE_MAP } from '../lib/routes.js'

function Inbox({ state, onSelectRecord }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [transcriptFilter, setTranscriptFilter] = useState('all')
  const [routeFilter, setRouteFilter] = useState('all')
  const [sortBy, setSortBy] = useState('timestamp-desc')

  const records = Object.values(state.records)

  const filtered = useMemo(() => {
    let result = records.filter(r => {
      // Text search
      if (search.trim()) {
        const q = search.toLowerCase()
        const title = getRecordTitle(r).toLowerCase()
        const ref = (r.recordRef || '').toLowerCase()
        const person = getPerson(r).toLowerCase()
        if (!title.includes(q) && !ref.includes(q) && !person.includes(q)) return false
      }

      if (typeFilter !== 'all' && r.sourceType !== typeFilter) return false

      if (transcriptFilter === 'with') {
        if (!hasUsableTranscript(r)) return false
      } else if (transcriptFilter === 'without') {
        if (hasUsableTranscript(r)) return false
      }

      if (routeFilter !== 'all') {
        const routes = r.manualRoute ? [r.manualRoute] : suggestRoutes(r)
        if (!routes.includes(routeFilter)) return false
      }

      return true
    })

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'timestamp-desc': {
          const ta = getActivityTimestamp(a) || ''
          const tb = getActivityTimestamp(b) || ''
          return tb.localeCompare(ta)
        }
        case 'timestamp-asc': {
          const ta = getActivityTimestamp(a) || ''
          const tb = getActivityTimestamp(b) || ''
          return ta.localeCompare(tb)
        }
        case 'ref': return (a.recordRef || '').localeCompare(b.recordRef || '')
        case 'type': return a.sourceType.localeCompare(b.sourceType)
        default: return 0
      }
    })

    return result
  }, [records, search, typeFilter, transcriptFilter, routeFilter, sortBy])

  return (
    <div className="inbox">
      <div className="page-header">
        <h2>Conversation Inbox</h2>
        <span className="result-count">{filtered.length} of {records.length} records</span>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={16} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by title, ref, or person..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search conversations"
          />
        </div>
        <label className="filter-item">
          <span className="filter-label">Type</span>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} aria-label="Filter by type">
            <option value="all">All</option>
            <option value="call">Calls</option>
            <option value="meeting">Meetings</option>
          </select>
        </label>
        <label className="filter-item">
          <span className="filter-label">Transcript</span>
          <select value={transcriptFilter} onChange={e => setTranscriptFilter(e.target.value)} aria-label="Filter by transcript availability">
            <option value="all">All</option>
            <option value="with">With transcript</option>
            <option value="without">No transcript</option>
          </select>
        </label>
        <label className="filter-item">
          <span className="filter-label">Route</span>
          <select value={routeFilter} onChange={e => setRouteFilter(e.target.value)} aria-label="Filter by route">
            <option value="all">All routes</option>
            {Object.values(ROUTE_MAP).map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </label>
        <label className="filter-item">
          <span className="filter-label">Sort</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort order">
            <option value="timestamp-desc">Newest first</option>
            <option value="timestamp-asc">Oldest first</option>
            <option value="ref">Record ref (A-Z)</option>
            <option value="type">Type (calls first)</option>
          </select>
        </label>
      </div>

      <div className="table-container">
        <table className="inbox-table">
          <thead>
            <tr>
              <th scope="col">Ref</th>
              <th scope="col">Type</th>
              <th scope="col">Title / Person</th>
              <th scope="col">Timestamp</th>
              <th scope="col">Transcript</th>
              <th scope="col">Route</th>
              <th scope="col">Review</th>
              <th scope="col">Rev.</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => {
              const routes = r.manualRoute ? [r.manualRoute] : suggestRoutes(r)
              const hasTranscript = hasUsableTranscript(r)
              const timestamp = getActivityTimestamp(r)
              const person = getPerson(r)
              const title = getRecordTitle(r)

              return (
                <tr
                  key={r.identity}
                  onClick={() => onSelectRecord(r.identity)}
                  className="inbox-row"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') onSelectRecord(r.identity) }}
                >
                  <td className="col-ref"><strong>{r.recordRef}</strong></td>
                  <td className="col-type">
                    {r.sourceType === 'call' ? <Phone size={16} aria-label="Call" /> : <Video size={16} aria-label="Meeting" />}
                  </td>
                  <td className="col-title">
                    <div className="cell-title">{title}</div>
                    <div className="cell-subtitle">{person}</div>
                  </td>
                  <td className="col-time">{formatTimestamp(timestamp)}</td>
                  <td className="col-transcript">
                    {hasTranscript ? (
                      <span className="badge badge-success"><FileText size={12} aria-hidden="true" /> Available</span>
                    ) : (
                      <span className="badge badge-muted"><FileX size={12} aria-hidden="true" /> Unavailable</span>
                    )}
                  </td>
                  <td className="col-route">
                    <div className="route-badges">
                      {routes.map(route => (
                        <span key={route} className="route-badge-sm" style={{ backgroundColor: ROUTE_MAP[route]?.color || '#9ca3af' }}>
                          {ROUTE_MAP[route]?.label || route}
                        </span>
                      ))}
                      {r.manualRoute && <span className="badge-manual" title="Manually set">Manual</span>}
                    </div>
                  </td>
                  <td className="col-review">
                    <span className={`review-tag review-${r.reviewState}`}>{r.reviewState}</span>
                  </td>
                  <td className="col-rev">v{r.appliedRevision}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-table-state">
            No records match the current filters.
          </div>
        )}
      </div>
    </div>
  )
}

function formatTimestamp(ts) {
  if (!ts) return '—'
  try {
    const date = new Date(ts)
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return ts
  }
}

export default Inbox
