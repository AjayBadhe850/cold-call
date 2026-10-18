import React from 'react';
import { PhoneCall, History, PlusCircle, Sparkles } from 'lucide-react';
import { HealthCheckResponse } from '@shared/types';

interface NavbarProps {
  activeTab: 'call' | 'history';
  setActiveTab: (tab: 'call' | 'history') => void;
  onOpenNewCallModal: () => void;
  healthInfo: HealthCheckResponse | null;
  hasActiveCall: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewCallModal,
  healthInfo,
  hasActiveCall
}) => {
  return (
    <header className="navbar" role="banner">
      <div className="nav-brand">
        <div className="brand-icon" aria-hidden="true">
          <PhoneCall size={20} />
        </div>
        <div>
          <span className="brand-title">
            ColdCall Copilot
            <span className="brand-badge">MVP v1.0</span>
          </span>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Main Navigation">
        <button
          type="button"
          className={`nav-tab-button ${activeTab === 'call' ? 'active' : ''}`}
          onClick={() => setActiveTab('call')}
          aria-current={activeTab === 'call' ? 'page' : undefined}
        >
          <PhoneCall size={16} />
          <span>Active Call</span>
          {hasActiveCall && <span className="status-dot active" title="Call in progress" />}
        </button>

        <button
          type="button"
          className={`nav-tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
          aria-current={activeTab === 'history' ? 'page' : undefined}
        >
          <History size={16} />
          <span>Call History</span>
        </button>
      </nav>

      <div className="nav-meta">
        <div className="status-pill" title={`Database: ${healthInfo?.database || 'Connecting...'} | LLM: ${healthInfo?.llmProvider || 'Gemini'}`}>
          <span className={`status-dot ${healthInfo?.status === 'ok' ? 'active' : 'warning'}`} />
          <span>{healthInfo?.database === 'supabase' ? 'Supabase' : 'Local DB'}</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <Sparkles size={12} color="#818cf8" />
          <span>{healthInfo?.llmConfigured ? 'Gemini AI' : 'Methodology'}</span>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenNewCallModal}
          id="btn-new-call-header"
        >
          <PlusCircle size={15} />
          <span>Start New Call</span>
        </button>
      </div>
    </header>
  );
};
