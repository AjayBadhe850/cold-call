import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CallRecord, CallStatus } from '@shared/types';
import { getStageByNumber } from '@shared/stages';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '../utils/formatters';
import { CallDetailsDrawer } from '../components/CallDetailsDrawer';
import { Search, Filter, History, Eye, Play, RefreshCw, Calendar } from 'lucide-react';

interface CallHistoryPageProps {
  onResumeCall: (call: CallRecord) => void;
  onStartNewCall: () => void;
}

export const CallHistoryPage: React.FC<CallHistoryPageProps> = ({
  onResumeCall,
  onStartNewCall
}) => {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const fetchCalls = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.listCalls();
      setCalls(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load call history from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  // Filter calls
  const filteredCalls = calls.filter(call => {
    const matchesSearch =
      (call.prospect_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (call.prospect_company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : call.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="history-page">
      {/* History Header & Controls */}
      <div className="history-header">
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={24} color="var(--primary)" />
            <span>Call History & Pipeline Records</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Inspect past cold calls, stages reached, verbatim prospect quotes, and AI insights.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={fetchCalls}
          disabled={isLoading}
        >
          <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px', width: '100%' }}
              placeholder="Search by prospect name, company, or ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="history-filters">
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          {(['all', 'completed', 'in_progress', 'ended_early'] as const).map(st => (
            <button
              key={st}
              type="button"
              className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'all' ? 'All Calls' : getStatusLabel(st as CallStatus)}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '1rem', color: 'var(--danger)', marginBottom: '1.5rem' }}>
          <strong>Error: </strong> {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div className="status-dot active" style={{ display: 'inline-block', width: '12px', height: '12px', marginBottom: '0.75rem' }} />
          <div>Loading saved calls from persistent database...</div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredCalls.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <History size={28} />
          </div>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>No Calls Found</h3>
          <p style={{ maxWidth: '400px' }}>
            {searchQuery || statusFilter !== 'all'
              ? 'No calls matched your filter criteria. Try clearing search filters.'
              : 'You have not conducted any cold calls yet. Start your first session to begin recording.'}
          </p>
          <button type="button" className="btn btn-primary" onClick={onStartNewCall}>
            Start Your First Call
          </button>
        </div>
      )}

      {/* Call Grid */}
      {!isLoading && filteredCalls.length > 0 && (
        <div className="history-card-grid">
          {filteredCalls.map(call => {
            const completedCount = call.stage_results ? call.stage_results.length : 0;
            const stageDef = getStageByNumber(call.current_stage_number);

            return (
              <div
                key={call.id}
                className="history-card"
                onClick={() => setSelectedCall(call)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setSelectedCall(call)}
              >
                <div className="history-card-header">
                  <span className={getStatusBadgeClass(call.status)}>
                    {getStatusLabel(call.status)}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} />
                    {formatDate(call.started_at)}
                  </span>
                </div>

                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                    {call.prospect_name || `Call #${call.id.slice(0, 8)}`}
                  </h4>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                    {call.prospect_company || 'No Company Recorded'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    Stage reached: <strong style={{ color: 'var(--text-main)' }}>{call.current_stage_number}/8</strong> ({stageDef.name})
                  </div>
                  <div>
                    Recorded: <strong style={{ color: 'var(--primary)' }}>{completedCount} stages</strong>
                  </div>
                </div>

                {call.summary && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'var(--bg-input)', padding: '0.5rem 0.65rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{call.summary}"
                  </p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCall(call);
                    }}
                  >
                    <Eye size={13} />
                    <span>Inspect</span>
                  </button>

                  {call.status === 'in_progress' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onResumeCall(call);
                      }}
                    >
                      <Play size={13} />
                      <span>Resume</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details Inspection Drawer */}
      <CallDetailsDrawer
        call={selectedCall}
        isOpen={Boolean(selectedCall)}
        onClose={() => setSelectedCall(null)}
        onResumeCall={call => {
          setSelectedCall(null);
          onResumeCall(call);
        }}
      />
    </div>
  );
};
