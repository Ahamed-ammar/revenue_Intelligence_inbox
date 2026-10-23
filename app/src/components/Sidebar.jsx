import React from 'react'
import { LayoutDashboard, Inbox, FileText, Download, Upload, Briefcase } from 'lucide-react'

function Sidebar({ currentView, onNavigate, recordCount, views }) {
  const navItems = [
    { id: views.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: views.INBOX, label: 'Inbox', icon: Inbox, badge: recordCount },
    { id: views.BRIEF, label: 'Manager Brief', icon: Briefcase },
    { id: views.IMPORT, label: 'Import / Demo', icon: Upload },
    { id: views.EXPORT, label: 'Export', icon: Download },
  ]

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      <div className="sidebar-header">
        <FileText size={24} aria-hidden="true" />
        <div>
          <h1 className="sidebar-title">Revenue Inbox</h1>
          <span className="sidebar-subtitle">SpendNest</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span className="nav-label">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          )
        })}
      </nav>
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">
          Rule-based analysis<br />
          No AI model used
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
