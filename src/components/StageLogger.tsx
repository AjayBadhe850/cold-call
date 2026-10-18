import React, { useState, useEffect } from 'react';
import { Save, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { ColdCallStageDefinition, CallStageResult, AiSuggestionResponse } from '@shared/types';
import { AiCopilotCard } from './AiCopilotCard';

interface StageLoggerProps {
  stage: ColdCallStageDefinition;
  savedResult?: CallStageResult;
  isSaving: boolean;
  isAiLoading: boolean;
  aiSuggestion: AiSuggestionResponse | null;
  onSaveStage: (outcome: string, prospectWords: string, notes: string) => Promise<any>;
  onRequestAi: (outcome: string, prospectWords: string, notes: string) => void;
  onNextStage: (targetStage?: number | 'completed' | 'ended_early') => void;
  onEndEarly: () => void;
  onCompleteCall: () => void;
}

export const StageLogger: React.FC<StageLoggerProps> = ({
  stage,
  savedResult,
  isSaving,
  isAiLoading,
  aiSuggestion,
  onSaveStage,
  onRequestAi,
  onNextStage,
  onEndEarly,
  onCompleteCall
}) => {
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [prospectWords, setProspectWords] = useState<string>('');
  const [callerNotes, setCallerNotes] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Synchronize state when stage changes or saved result arrives
  useEffect(() => {
    if (savedResult) {
      setSelectedOutcome(savedResult.outcome || '');
      setProspectWords(savedResult.prospect_words || '');
      setCallerNotes(savedResult.caller_notes || '');
      setHasUnsavedChanges(false);
    } else {
      // Default to first success outcome
      const defaultOutcome = stage.outcomes[0]?.value || '';
      setSelectedOutcome(defaultOutcome);
      setProspectWords('');
      setCallerNotes('');
      setHasUnsavedChanges(false);
    }
  }, [stage.stageNumber, savedResult]);

  const handleOutcomeSelect = (val: string) => {
    setSelectedOutcome(val);
    setHasUnsavedChanges(true);
  };

  const handleWordsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProspectWords(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCallerNotes(e.target.value);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!selectedOutcome) return;
    await onSaveStage(selectedOutcome, prospectWords, callerNotes);
    setHasUnsavedChanges(false);
  };

  const handleTriggerAi = () => {
    onRequestAi(selectedOutcome, prospectWords, callerNotes);
  };

  // Find currently selected outcome details
  const activeOutcomeDef = stage.outcomes.find(o => o.value === selectedOutcome);

  return (
    <div className="panel-card" aria-label="Record Stage Outcome Form">
      <div className="panel-header">
        <h3 className="panel-title">
          <CheckCircle2 size={18} color="var(--primary)" />
          <span>Record Stage {stage.stageNumber} Outcome</span>
        </h3>
        {savedResult && !hasUnsavedChanges && (
          <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600 }}>
            ✓ Stage Saved
          </span>
        )}
      </div>

      {/* Outcome Selectors */}
      <div className="form-group">
        <label className="form-label">
          <span>Selected Outcome</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Click to select</span>
        </label>
        <div className="outcome-options-grid" role="radiogroup" aria-label="Stage Outcomes">
          {stage.outcomes.map(opt => {
            const isSelected = selectedOutcome === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                className={`outcome-option-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => handleOutcomeSelect(opt.value)}
                role="radio"
                aria-checked={isSelected}
              >
                <div>
                  <div className="outcome-option-label">{opt.label}</div>
                  <div className="outcome-option-desc">{opt.description}</div>
                </div>
                {opt.terminatesCall ? (
                  <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 600 }}>
                    Ends Call
                  </span>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>
                    → Stage {opt.recommendedNextStage || stage.defaultNextStage}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prospect Exact Words */}
      <div className="form-group">
        <label className="form-label" htmlFor="prospect-words-input">
          <span>Prospect's Actual Words (Verbatim Quote)</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {prospectWords.length} chars
          </span>
        </label>
        <textarea
          id="prospect-words-input"
          className="form-textarea"
          placeholder="Type what the prospect literally said (e.g. 'I don't have time right now, we use Gong')..."
          value={prospectWords}
          onChange={handleWordsChange}
          rows={3}
        />
      </div>

      {/* Caller Notes */}
      <div className="form-group">
        <label className="form-label" htmlFor="caller-notes-input">
          <span>Representative Private Notes (Optional)</span>
        </label>
        <textarea
          id="caller-notes-input"
          className="form-textarea"
          placeholder="e.g. Tone sounded receptive, mentioned 15 reps on team, followup on Thursday..."
          value={callerNotes}
          onChange={handleNotesChange}
          rows={2}
          style={{ minHeight: '60px' }}
        />
      </div>

      {/* Action Buttons: Save & AI */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={handleSave}
          disabled={isSaving || !selectedOutcome}
          id="btn-save-stage"
        >
          <Save size={16} />
          <span>{isSaving ? 'Saving...' : 'Save Stage Result'}</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleTriggerAi}
          disabled={isAiLoading}
          id="btn-ask-ai"
          title="Get instant recommendation from AI"
        >
          <Sparkles size={16} color="var(--primary)" />
          <span>{isAiLoading ? 'Analyzing...' : 'Ask AI'}</span>
        </button>
      </div>

      {/* AI Suggestion Card */}
      <AiCopilotCard
        suggestion={aiSuggestion}
        isLoading={isAiLoading}
        onRequestAi={handleTriggerAi}
        onApplyNextStage={target => {
          if (target === 'completed') {
            onCompleteCall();
          } else if (target === 'ended_early') {
            onEndEarly();
          } else if (typeof target === 'number') {
            onNextStage(target);
          }
        }}
      />

      {/* Navigation Progression Footer */}
      <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Recommended: {activeOutcomeDef?.terminatesCall ? 'End / Complete Call' : `Stage ${activeOutcomeDef?.recommendedNextStage || stage.defaultNextStage}`}
        </span>

        {activeOutcomeDef?.terminatesCall ? (
          stage.stageNumber === 8 ? (
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={onCompleteCall}
              id="btn-finish-call-flow"
            >
              <span>Complete Call</span>
              <CheckCircle2 size={14} />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={onEndEarly}
              id="btn-end-early-flow"
            >
              <span>Wrap Up & End Call</span>
            </button>
          )
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => onNextStage(activeOutcomeDef?.recommendedNextStage || stage.defaultNextStage)}
            id="btn-proceed-next-stage"
          >
            <span>Proceed to Next Stage</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
