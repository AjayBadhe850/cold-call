import React, { useState } from 'react';
import { Sparkles, ArrowRight, Copy, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { AiSuggestionResponse } from '@shared/types';

interface AiCopilotCardProps {
  suggestion: AiSuggestionResponse | null;
  isLoading: boolean;
  onRequestAi: () => void;
  onApplyNextStage?: (nextStage: number | 'completed' | 'ended_early') => void;
}

export const AiCopilotCard: React.FC<AiCopilotCardProps> = ({
  suggestion,
  isLoading,
  onRequestAi,
  onApplyNextStage
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!suggestion?.suggestedScript) return;
    navigator.clipboard.writeText(suggestion.suggestedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!suggestion && !isLoading) {
    return (
      <div className="ai-copilot-card" style={{ textAlign: 'center', padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={18} color="var(--primary)" />
          <strong style={{ fontSize: '0.95rem' }}>AI Sales Copilot</strong>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
          Select an outcome or log what the prospect said, then request live AI guidance.
        </p>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onRequestAi}
          id="btn-trigger-ai"
          style={{ width: '100%' }}
        >
          <Sparkles size={14} />
          <span>Get AI Stage Recommendation</span>
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="ai-copilot-card" style={{ alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div className="status-dot active" style={{ width: '12px', height: '12px', marginBottom: '0.75rem' }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
          Analyzing conversation & generating recommendation...
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Evaluating prospect sentiment & stage objectives
        </span>
      </div>
    );
  }

  if (!suggestion) return null;

  return (
    <div className="ai-copilot-card" aria-label="AI Recommendation Card">
      <div className="ai-header">
        <div className="ai-badge">
          <Sparkles size={15} />
          <span>{suggestion.provider}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: suggestion.confidence === 'high' ? 'var(--success)' : 'var(--warning)',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)'
            }}
          >
            {suggestion.confidence} confidence
          </span>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}
            onClick={onRequestAi}
            title="Retry AI request"
          >
            Refresh
          </button>
        </div>
      </div>

      {suggestion.is_fallback && (
        <div className="ai-fallback-notice">
          <AlertTriangle size={14} />
          <span>{suggestion.fallback_reason || 'Using methodology fallback engine.'}</span>
        </div>
      )}

      {suggestion.detectedObjection && (
        <div style={{ fontSize: '0.75rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} />
          <span>Detected Objection: <strong>"{suggestion.detectedObjection}"</strong></span>
        </div>
      )}

      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
          Recommended Response to Say:
        </div>
        <div className="ai-script-box" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <span>"{suggestion.suggestedScript}"</span>
          <button
            type="button"
            className="copy-btn"
            onClick={handleCopy}
            title="Copy script to clipboard"
          >
            {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      <div className="ai-rationale">
        <strong>Why: </strong>
        <span>{suggestion.rationale}</span>
      </div>

      {onApplyNextStage && suggestion.recommendedNextStage !== undefined && (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'space-between' }}
          onClick={() => onApplyNextStage(suggestion.recommendedNextStage)}
          id="btn-apply-ai-next-stage"
        >
          <span>{suggestion.nextStepLabel}</span>
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
};
