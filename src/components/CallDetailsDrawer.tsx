import React from 'react';
import { X, Calendar, Building, Play, Sparkles, MessageSquare, StickyNote } from 'lucide-react';
import { CallRecord } from '@shared/types';
import { getStageByNumber } from '@shared/stages';
import { formatDate, getStatusBadgeClass, getStatusLabel } from '../utils/formatters';

interface CallDetailsDrawerProps {
  call: CallRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onResumeCall?: (call: CallRecord) => void;
}

export const CallDetailsDrawer: React.FC<CallDetailsDrawerProps> = ({
  call,
  isOpen,
  onClose,
  onResumeCall
}) => {
  if (!isOpen || !call) return null;

  const results = call.stage_results || [];

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="call-details-title">
      <div className="modal-content" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h3 id="call-details-title" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                {call.prospect_name || `Call #${call.id.slice(0, 8)}`}
              </h3>
              <span className={getStatusBadgeClass(call.status)}>
                {getStatusLabel(call.status)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.825rem' }}>
              <span><Building size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{call.prospect_company || 'No Company'}</span>
              <span>•</span>
              <span><Calendar size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{formatDate(call.started_at)}</span>
            </div>
          </div>

          <button type="button" className="copy-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Call Summary Banner */}
        {call.summary && (
          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)' }}>
              Call Summary
            </span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.25rem', lineHeight: 1.45 }}>
              {call.summary}
            </p>
          </div>
        )}

        {/* Stage Timeline */}
        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Stage Outcomes & Prospect Quotes ({results.length} Recorded)
          </h4>

          {results.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No stage outcomes were recorded during this call.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {results.map(res => {
                const stageDef = getStageByNumber(res.stage_number);
                return (
                  <div
                    key={res.stage_number}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>
                        Stage {res.stage_number}: {stageDef.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        {res.outcome.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {res.prospect_words && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '0.4rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                        <MessageSquare size={14} color="var(--info)" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span>"{res.prospect_words}"</span>
                      </div>
                    )}

                    {res.caller_notes && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <StickyNote size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>Note: {res.caller_notes}</span>
                      </div>
                    )}

                    {res.ai_recommendation && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', marginTop: '0.3rem', fontSize: '0.8rem', color: '#a5b4fc' }}>
                        <Sparkles size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>AI Suggestion: {res.ai_recommendation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          {onResumeCall && call.status === 'in_progress' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onResumeCall(call)}
            >
              <Play size={16} />
              <span>Resume Active Call</span>
            </button>
          )}

          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
