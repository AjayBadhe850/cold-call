import React from 'react';
import { Clock, CheckCircle2, PhoneOff, User, Building, Plus } from 'lucide-react';
import { CallRecord } from '@shared/types';
import { formatDuration, getStatusBadgeClass, getStatusLabel } from '../utils/formatters';

interface CallHeaderProps {
  call: CallRecord | null;
  durationSeconds: number;
  currentStageNumber: number;
  currentStageName: string;
  onEndEarly: () => void;
  onCompleteCall: () => void;
  onStartNew: () => void;
}

export const CallHeader: React.FC<CallHeaderProps> = ({
  call,
  durationSeconds,
  currentStageNumber,
  currentStageName,
  onEndEarly,
  onCompleteCall,
  onStartNew
}) => {
  if (!call) {
    return (
      <div className="call-header-card">
        <div className="call-header-top">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Call Active</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Ready to start your next cold call? Launch a session to begin live stage guidance.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={onStartNew} id="btn-start-call-empty">
            <Plus size={16} />
            <span>Start Fresh Call</span>
          </button>
        </div>
      </div>
    );
  }

  const isLive = call.status === 'in_progress';
  const prospectDisplayName = call.prospect_name || `Call #${call.id.slice(0, 8)}`;
  const initials = call.prospect_name
    ? call.prospect_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'CC';

  return (
    <div className="call-header-card">
      <div className="call-header-top">
        <div className="call-prospect-info">
          <div className="prospect-avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="prospect-details">
            <h2>
              <User size={18} style={{ color: 'var(--text-muted)' }} />
              <span>{prospectDisplayName}</span>
              <span className={getStatusBadgeClass(call.status)}>
                {getStatusLabel(call.status)}
              </span>
            </h2>
            <div className="prospect-company">
              <Building size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
              <span>{call.prospect_company || 'Target Organization'}</span>
              <span style={{ margin: '0 8px', opacity: 0.4 }}>|</span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                Stage {currentStageNumber} of 8: {currentStageName}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className="call-timer-badge" title="Call duration">
            <Clock size={16} style={{ color: isLive ? 'var(--primary)' : 'var(--text-muted)' }} />
            <span>{formatDuration(durationSeconds)}</span>
          </div>

          <div className="call-header-actions">
            {isLive ? (
              <>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={onEndEarly}
                  id="btn-end-call-early"
                  title="Mark call as ended early"
                >
                  <PhoneOff size={15} />
                  <span>End Early</span>
                </button>

                <button
                  type="button"
                  className="btn btn-success btn-sm"
                  onClick={onCompleteCall}
                  id="btn-complete-call"
                  title="Mark call as successfully completed"
                >
                  <CheckCircle2 size={15} />
                  <span>Complete Call</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onStartNew}
                id="btn-start-another-call"
              >
                <Plus size={15} />
                <span>New Call</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
