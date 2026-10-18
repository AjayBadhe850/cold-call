import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ActiveCallPage } from './pages/ActiveCallPage';
import { CallHistoryPage } from './pages/CallHistoryPage';
import { NewCallModal } from './components/NewCallModal';
import { useCallSession } from './hooks/useCallSession';
import { api } from './services/api';
import { CallRecord, HealthCheckResponse } from '@shared/types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'call' | 'history'>('call');
  const [isNewCallModalOpen, setIsNewCallModalOpen] = useState(false);
  const [healthInfo, setHealthInfo] = useState<HealthCheckResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const session = useCallSession();

  // Periodically check backend health
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const info = await api.checkHealth();
        setHealthInfo(info);
      } catch (err) {
        console.warn('Backend health check error:', err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleStartCall = async (prospectName: string, prospectCompany: string) => {
    try {
      await session.startNewCall(prospectName, prospectCompany);
      setActiveTab('call');
      showToast('New cold call started. Guided at Stage 1.');
    } catch (err: any) {
      showToast(`Error starting call: ${err.message}`);
    }
  };

  const handleResumeCall = async (call: CallRecord) => {
    try {
      await session.loadCall(call.id);
      setActiveTab('call');
      showToast(`Resumed call with ${call.prospect_name || 'Prospect'}`);
    } catch (err: any) {
      showToast(`Error loading call: ${err.message}`);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewCallModal={() => setIsNewCallModalOpen(true)}
        healthInfo={healthInfo}
        hasActiveCall={Boolean(session.currentCall && session.currentCall.status === 'in_progress')}
      />

      {/* Main Content Area */}
      <main className="main-content" role="main">
        {activeTab === 'call' ? (
          <ActiveCallPage
            session={session}
            onOpenNewCallModal={() => setIsNewCallModalOpen(true)}
            onNavigateHistory={() => setActiveTab('history')}
            showToast={showToast}
          />
        ) : (
          <CallHistoryPage
            onResumeCall={handleResumeCall}
            onStartNewCall={() => setIsNewCallModalOpen(true)}
          />
        )}
      </main>

      {/* New Call Creation Modal */}
      <NewCallModal
        isOpen={isNewCallModalOpen}
        isLoading={session.isLoading}
        onClose={() => setIsNewCallModalOpen(false)}
        onStartCall={handleStartCall}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <aside className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={16} color="var(--success)" />
          <span>{toastMessage}</span>
        </aside>
      )}

      {/* Session error toast */}
      {session.errorMessage && (
        <aside className="toast" style={{ borderColor: 'var(--danger-border)', color: 'var(--danger)' }} role="alert">
          <AlertCircle size={16} color="var(--danger)" />
          <span>{session.errorMessage}</span>
          <button
            type="button"
            className="copy-btn"
            onClick={session.clearError}
            style={{ marginLeft: 'auto' }}
          >
            ✕
          </button>
        </aside>
      )}
    </div>
  );
}

export default App;
