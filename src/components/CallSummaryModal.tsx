import React, { useState } from 'react';
import { CheckCircle2, Sparkles, X, Save, ArrowRight } from 'lucide-react';
import { CallRecord, CallStageResult, CallSummaryResponse } from '@shared/types';
import { api } from '../services/api';

interface CallSummaryModalProps {
  call: CallRecord;
  stageResults: CallStageResult[];
  isOpen: boolean;
  onClose: () => void;
  onSavedSummary: (updatedCall: CallRecord) => void;
  onNavigateHistory: () => void;
}

export const CallSummaryModal: React.FC<CallSummaryModalProps> = ({
  call,
  stageResults,
  isOpen,
  onClose,
  onSavedSummary,
  onNavigateHistory
}) => {
  const [summaryText, setSummaryText] = useState<string>(call.summary || '');
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<CallSummaryResponse | null>(null);

  if (!isOpen) return null;

  const handleGenerateAiSummary = async () => {
    setIsGenerating(true);
    try {
      const response = await api.generateSummary(call.id);
      setSummaryData(response);
      setSummaryText(response.summary);
      setKeyTakeaways(response.keyTakeaways || []);
    } catch (err) {
      console.error('Failed to generate summary:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndDone = async () => {
    setIsSaving(true);
    try {
      const updated = await api.updateCall(call.id, {
        summary: summaryText
      });
      onSavedSummary(updated);
      onClose();
      onNavigateHistory();
    } catch (err) {
      console.error('Failed to save call summary:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="summary-modal-title">
      <div className="modal-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={22} color="var(--success)" />
            <h3 id="summary-modal-title" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Call Summary & Wrap-up
            </h3>
          </div>
          <button
            type="button"
            className="copy-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Review the outcome of your call with <strong>{call.prospect_name || 'Prospect'}</strong> ({call.prospect_company || 'Company'}).
          Stages recorded: <strong>{stageResults.length} / 8</strong>.
        </p>

        {/* AI Summary Generator trigger */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>AI Executive Summary</span>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleGenerateAiSummary}
            disabled={isGenerating}
            id="btn-gen-summary"
          >
            {isGenerating ? 'Synthesizing...' : 'Generate with AI'}
          </button>
        </div>

        {summaryData && summaryData.is_fallback && (
          <div style={{ fontSize: '0.75rem', color: 'var(--warning)', background: 'var(--warning-bg)', padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)' }}>
            Note: Generated using structured sales synthesis.
          </div>
        )}

        {/* Editable Summary Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="call-summary-textarea">
            <span>Call Summary (Persisted to Database)</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Editable</span>
          </label>
          <textarea
            id="call-summary-textarea"
            className="form-textarea"
            rows={3}
            placeholder="Executive summary of the call, agreed next steps, and prospect sentiment..."
            value={summaryText}
            onChange={e => setSummaryText(e.target.value)}
          />
        </div>

        {/* Key takeaways if available */}
        {keyTakeaways.length > 0 && (
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Key Call Milestones
            </span>
            <ul style={{ listStyleType: 'disc', paddingLeft: '1.25rem', marginTop: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {keyTakeaways.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '0.2rem' }}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
          >
            Dismiss
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveAndDone}
            disabled={isSaving}
            id="btn-save-summary-done"
          >
            <Save size={16} />
            <span>{isSaving ? 'Saving...' : 'Save & View in History'}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
