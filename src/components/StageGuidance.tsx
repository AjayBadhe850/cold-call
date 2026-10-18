import React, { useState } from 'react';
import { Target, MessageSquare, Copy, Check, ShieldAlert, Sparkles } from 'lucide-react';
import { ColdCallStageDefinition } from '@shared/types';

interface StageGuidanceProps {
  stage: ColdCallStageDefinition;
  prospectName?: string;
  prospectCompany?: string;
}

export const StageGuidance: React.FC<StageGuidanceProps> = ({
  stage,
  prospectName = 'Prospect',
  prospectCompany = 'Company'
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    // Interpolate placeholders
    const formatted = text
      .replace(/{{prospect_name}}/g, prospectName || 'Prospect')
      .replace(/{{company_name}}/g, prospectCompany || 'your company')
      .replace(/{{caller_name}}/g, 'Alex')
      .replace(/{{prospect_email}}/g, 'prospect@company.com');

    navigator.clipboard.writeText(formatted);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="panel-card" aria-label="Stage Guidance and Battlecard">
      <div className="panel-header">
        <h3 className="panel-title">
          <Target size={18} color="var(--primary)" />
          <span>Stage {stage.stageNumber} Guidance & Coaching</span>
        </h3>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {stage.name}
        </span>
      </div>

      {/* Purpose Banner */}
      <div className="guidance-banner">
        <div className="guidance-tagline">{stage.tagline}</div>
        <p className="guidance-purpose">{stage.purpose}</p>
        <div className="guidance-objective">
          <strong>Key Objective: </strong>
          {stage.callerObjective}
        </div>
      </div>

      {/* Talking Points */}
      <div>
        <div className="section-label">
          <MessageSquare size={14} />
          <span>Recommended Script & Talking Points</span>
        </div>
        <div className="talking-points-list">
          {stage.talkingPoints.map((point, idx) => {
            const interpolated = point
              .replace(/{{prospect_name}}/g, prospectName || 'Prospect')
              .replace(/{{company_name}}/g, prospectCompany || 'your company')
              .replace(/{{caller_name}}/g, 'Alex')
              .replace(/{{prospect_email}}/g, 'prospect@company.com');

            return (
              <div key={idx} className="talking-point-item">
                <p className="talking-point-text">"{interpolated}"</p>
                <button
                  type="button"
                  className="copy-btn"
                  onClick={() => handleCopy(point, idx)}
                  title="Copy talking point to clipboard"
                >
                  {copiedIndex === idx ? (
                    <Check size={16} color="var(--success)" />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Likely Objections & Rebuttals */}
      {stage.objections && stage.objections.length > 0 && (
        <div>
          <div className="section-label" style={{ color: '#fbbf24' }}>
            <ShieldAlert size={14} color="#fbbf24" />
            <span>Common Objections & Live Rebuttals</span>
          </div>
          <div className="objections-list">
            {stage.objections.map((obj, idx) => (
              <div key={idx} className="objection-card">
                <div className="objection-header">
                  <span>If prospect says:</span>
                  <strong>"{obj.objection}"</strong>
                </div>
                <p className="objection-response">
                  <strong>Say: </strong>"{obj.suggestedResponse.replace(/{{company_name}}/g, prospectCompany || 'your company')}"
                </p>
                {obj.tip && <p className="objection-tip">Coach's Tip: {obj.tip}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Example Prospect Responses */}
      <div>
        <div className="section-label">
          <Sparkles size={14} />
          <span>Anticipated Prospect Responses</span>
        </div>
        <div className="example-responses-grid">
          {stage.exampleProspectResponses.map((example, idx) => (
            <div key={idx} className="example-response-bubble">
              "{example}"
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
