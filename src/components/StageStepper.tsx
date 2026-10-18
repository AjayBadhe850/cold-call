import React from 'react';
import { Check, CircleDot, AlertCircle } from 'lucide-react';
import { COLD_CALL_STAGES } from '@shared/stages';
import { CallStageResult, CallStatus } from '@shared/types';

interface StageStepperProps {
  currentStageNumber: number;
  stageResults: Map<number, CallStageResult>;
  onSelectStage: (stageNumber: number) => void;
  callStatus?: CallStatus;
}

export const StageStepper: React.FC<StageStepperProps> = ({
  currentStageNumber,
  stageResults,
  onSelectStage,
  callStatus
}) => {
  return (
    <div className="stepper-container" role="tablist" aria-label="Cold Call 8 Stages">
      {COLD_CALL_STAGES.map(stage => {
        const isCurrent = stage.stageNumber === currentStageNumber;
        const isSaved = stageResults.has(stage.stageNumber);
        const isEndedEarly = callStatus === 'ended_early' && isCurrent;

        let itemClass = 'step-item';
        if (isCurrent) itemClass += ' active';
        if (isSaved) itemClass += ' completed';

        return (
          <button
            key={stage.stageNumber}
            type="button"
            className={itemClass}
            onClick={() => onSelectStage(stage.stageNumber)}
            role="tab"
            aria-selected={isCurrent}
            id={`step-tab-${stage.stageNumber}`}
            title={`Stage ${stage.stageNumber}: ${stage.name}`}
          >
            <div className="step-top">
              <span className="step-number">Stage {stage.stageNumber}</span>
              <div className="step-badge" aria-hidden="true">
                {isEndedEarly ? (
                  <AlertCircle size={14} color="var(--danger)" />
                ) : isSaved ? (
                  <Check size={14} color="var(--success)" strokeWidth={3} />
                ) : isCurrent ? (
                  <CircleDot size={14} color="var(--primary)" />
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                )}
              </div>
            </div>
            <span className="step-name">{stage.name}</span>
          </button>
        );
      })}
    </div>
  );
};
