import React, { useState } from 'react';
import { CallHeader } from '../components/CallHeader';
import { StageStepper } from '../components/StageStepper';
import { StageGuidance } from '../components/StageGuidance';
import { StageLogger } from '../components/StageLogger';
import { CallSummaryModal } from '../components/CallSummaryModal';
import { useCallSession } from '../hooks/useCallSession';
import { CallRecord } from '@shared/types';

interface ActiveCallPageProps {
  session: ReturnType<typeof useCallSession>;
  onOpenNewCallModal: () => void;
  onNavigateHistory: () => void;
  showToast: (msg: string) => void;
}

export const ActiveCallPage: React.FC<ActiveCallPageProps> = ({
  session,
  onOpenNewCallModal,
  onNavigateHistory,
  showToast
}) => {
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const {
    currentCall,
    currentStageNumber,
    currentStageDef,
    currentStageResult,
    stageResults,
    durationSeconds,
    aiSuggestion,
    isSaving,
    isAiLoading,
    navigateToStage,
    saveCurrentStage,
    requestAiGuidance,
    endCallEarly,
    completeCall
  } = session;

  const handleSave = async (outcome: string, prospectWords: string, notes: string) => {
    const res = await saveCurrentStage(outcome, prospectWords, notes, aiSuggestion?.suggestedScript);
    if (res) {
      showToast(`Saved Stage ${currentStageNumber} outcome: ${outcome.replace(/_/g, ' ')}`);
    }
  };

  const handleRequestAi = (outcome: string, prospectWords: string, notes: string) => {
    requestAiGuidance(outcome, prospectWords, notes);
  };

  const handleNextStage = (targetStage?: number | 'completed' | 'ended_early') => {
    if (targetStage === 'completed') {
      handleCompleteCall();
    } else if (targetStage === 'ended_early') {
      handleEndEarly();
    } else if (typeof targetStage === 'number') {
      navigateToStage(targetStage);
    } else if (currentStageNumber < 8) {
      navigateToStage(currentStageNumber + 1);
    }
  };

  const handleEndEarly = async () => {
    const updated = await endCallEarly();
    if (updated) {
      showToast('Call ended early.');
      setIsSummaryModalOpen(true);
    }
  };

  const handleCompleteCall = async () => {
    const updated = await completeCall();
    if (updated) {
      showToast('Call successfully completed!');
      setIsSummaryModalOpen(true);
    }
  };

  const handleSavedSummary = (_updated: CallRecord) => {
    showToast('Call summary saved to database.');
  };

  return (
    <div className="active-call-page">
      {/* Call Header */}
      <CallHeader
        call={currentCall}
        durationSeconds={durationSeconds}
        currentStageNumber={currentStageNumber}
        currentStageName={currentStageDef.name}
        onEndEarly={handleEndEarly}
        onCompleteCall={handleCompleteCall}
        onStartNew={onOpenNewCallModal}
      />

      {currentCall && (
        <>
          {/* 8-Stage Progress Stepper */}
          <div style={{ marginBottom: '1.5rem' }}>
            <StageStepper
              currentStageNumber={currentStageNumber}
              stageResults={stageResults}
              onSelectStage={navigateToStage}
              callStatus={currentCall.status}
            />
          </div>

          {/* 2-Column Responsive Calling Grid */}
          <div className="calling-grid">
            {/* Left Column: Guidance & Battlecard */}
            <div className="guidance-column">
              <StageGuidance
                stage={currentStageDef}
                prospectName={currentCall.prospect_name || undefined}
                prospectCompany={currentCall.prospect_company || undefined}
              />
            </div>

            {/* Right Column: Outcome Logger & AI Assistant */}
            <div className="logger-column">
              <StageLogger
                stage={currentStageDef}
                savedResult={currentStageResult}
                isSaving={isSaving}
                isAiLoading={isAiLoading}
                aiSuggestion={aiSuggestion}
                onSaveStage={handleSave}
                onRequestAi={handleRequestAi}
                onNextStage={handleNextStage}
                onEndEarly={handleEndEarly}
                onCompleteCall={handleCompleteCall}
              />
            </div>
          </div>

          {/* Summary Modal */}
          <CallSummaryModal
            call={currentCall}
            stageResults={Array.from(stageResults.values())}
            isOpen={isSummaryModalOpen}
            onClose={() => setIsSummaryModalOpen(false)}
            onSavedSummary={handleSavedSummary}
            onNavigateHistory={onNavigateHistory}
          />
        </>
      )}
    </div>
  );
};
