import React, { useState, useEffect, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './components/Dashboard.jsx'
import Inbox from './components/Inbox.jsx'
import DetailView from './components/DetailView.jsx'
import ManagerBrief from './components/ManagerBrief.jsx'
import ImportPanel from './components/ImportPanel.jsx'
import ExportPanel from './components/ExportPanel.jsx'
import { createInitialState, applyBatch, setManualRoute, resetManualRoute, setReviewState, markAnalysisReviewed, saveState, loadState, clearState } from './lib/importEngine.js'
import { parseBatch } from './lib/importEngine.js'
import initialData from './data/initial.json'
import updateData from './data/update.json'

const VIEWS = {
  DASHBOARD: 'dashboard',
  INBOX: 'inbox',
  DETAIL: 'detail',
  BRIEF: 'brief',
  IMPORT: 'import',
  EXPORT: 'export',
}

function App() {
  const [state, setState] = useState(createInitialState())
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD)
  const [selectedIdentity, setSelectedIdentity] = useState(null)
  const [toast, setToast] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load persisted state on mount
  useEffect(() => {
    const saved = loadState()
    if (saved && saved.records && Object.keys(saved.records).length > 0) {
      setState(saved)
    }
    setIsLoaded(true)
  }, [])

  // Persist state changes
  useEffect(() => {
    if (isLoaded) {
      saveState(state)
    }
  }, [state, isLoaded])

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
  }, [])

  const handleImport = useCallback((jsonString, sourceLabel = 'file') => {
    const { batch, errors } = parseBatch(jsonString)
    if (errors.length > 0) {
      showToast(`Import failed: ${errors.join('; ')}`, 'error')
      return { success: false, errors }
    }

    const { state: newState, summary } = applyBatch(state, batch)
    setState(newState)

    const message = `Imported ${sourceLabel}: ${summary.inserted} inserted, ${summary.updated} updated, ${summary.ignoredStale} ignored (stale/duplicate), ${summary.rejected} rejected`
    showToast(message, summary.rejected > 0 ? 'warning' : 'success')

    if (summary.errors.length > 0) {
      console.warn('Import errors:', summary.errors)
    }

    return { success: true, summary }
  }, [state, showToast])

  const handleLoadInitial = useCallback(() => {
    handleImport(JSON.stringify(initialData), 'initial batch')
  }, [handleImport])

  const handleApplyUpdate = useCallback(() => {
    handleImport(JSON.stringify(updateData), 'update batch')
  }, [handleImport])

  const handleLoadAll = useCallback(() => {
    handleImport(JSON.stringify(initialData), 'initial batch')
    // Small delay to ensure state update is processed
    setTimeout(() => {
      handleImport(JSON.stringify(updateData), 'update batch')
    }, 100)
  }, [handleImport])

  const handleFileImport = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      handleImport(e.target.result, file.name)
    }
    reader.onerror = () => {
      showToast('Failed to read file', 'error')
    }
    reader.readAsText(file)
  }, [handleImport, showToast])

  const handleReset = useCallback(() => {
    if (window.confirm('This will clear all imported records, manual routes, and review states. Continue?')) {
      clearState()
      setState(createInitialState())
      setSelectedIdentity(null)
      showToast('All data cleared. Use "Load Initial" to start fresh.', 'info')
    }
  }, [showToast])

  const handleSelectRecord = useCallback((identity) => {
    setSelectedIdentity(identity)
    setCurrentView(VIEWS.DETAIL)
  }, [])

  const handleSetManualRoute = useCallback((identity, route) => {
    setState(prev => setManualRoute(prev, identity, route))
    showToast(`Manual route set: ${route}`, 'success')
  }, [showToast])

  const handleResetManualRoute = useCallback((identity) => {
    setState(prev => resetManualRoute(prev, identity))
    showToast('Manual route reset. Suggested route is now active.', 'info')
  }, [showToast])

  const handleSetReviewState = useCallback((identity, reviewState) => {
    setState(prev => setReviewState(prev, identity, reviewState))
  }, [])

  const handleMarkAnalysisReviewed = useCallback((identity) => {
    setState(prev => markAnalysisReviewed(prev, identity))
    showToast('Analysis marked as reviewed and current.', 'success')
  }, [showToast])

  const records = Object.values(state.records)
  const hasData = records.length > 0

  return (
    <div className="app-container">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        recordCount={records.length}
        views={VIEWS}
      />
      <main className="main-content">
        {!hasData && currentView !== VIEWS.IMPORT && (
          <div className="empty-state">
            <h2>No data loaded</h2>
            <p>Import data to get started. Use the demo load buttons or import the supplied JSON files.</p>
            <div className="empty-state-actions">
              <button className="btn btn-primary" onClick={handleLoadAll}>
                Load Demo Data (Both Batches)
              </button>
              <button className="btn btn-secondary" onClick={() => setCurrentView(VIEWS.IMPORT)}>
                Go to Import Panel
              </button>
            </div>
          </div>
        )}
        {hasData || currentView === VIEWS.IMPORT ? (
          <>
            {currentView === VIEWS.DASHBOARD && (
              <Dashboard state={state} onSelectRecord={handleSelectRecord} />
            )}
            {currentView === VIEWS.INBOX && (
              <Inbox state={state} onSelectRecord={handleSelectRecord} />
            )}
            {currentView === VIEWS.DETAIL && selectedIdentity && (
              <DetailView
                record={state.records[selectedIdentity]}
                onSetManualRoute={handleSetManualRoute}
                onResetManualRoute={handleResetManualRoute}
                onSetReviewState={handleSetReviewState}
                onMarkAnalysisReviewed={handleMarkAnalysisReviewed}
                onBack={() => setCurrentView(VIEWS.INBOX)}
              />
            )}
            {currentView === VIEWS.BRIEF && (
              <ManagerBrief state={state} onSelectRecord={handleSelectRecord} />
            )}
            {currentView === VIEWS.IMPORT && (
              <ImportPanel
                state={state}
                onLoadInitial={handleLoadInitial}
                onApplyUpdate={handleApplyUpdate}
                onLoadAll={handleLoadAll}
                onFileImport={handleFileImport}
                onReset={handleReset}
              />
            )}
            {currentView === VIEWS.EXPORT && (
              <ExportPanel state={state} />
            )}
          </>
        ) : null}
      </main>
      {toast && (
        <div className={`toast toast-${toast.type}`} role="alert" aria-live="polite">
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default App
export { VIEWS }
