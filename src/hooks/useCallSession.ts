import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { CallRecord, CallStageResult, AiSuggestionResponse } from '@shared/types';
import { getStageByNumber } from '@shared/stages';

export function useCallSession() {
  const [currentCall, setCurrentCall] = useState<CallRecord | null>(null);
  const [currentStageNumber, setCurrentStageNumber] = useState<number>(1);
  const [stageResults, setStageResults] = useState<Map<number, CallStageResult>>(new Map());
  const [durationSeconds, setDurationSeconds] = useState<number>(0);
  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestionResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Duration timer management
  useEffect(() => {
    if (currentCall && currentCall.status === 'in_progress') {
      const startTime = new Date(currentCall.started_at).getTime();
      const updateElapsed = () => {
        const now = Date.now();
        const elapsed = Math.max(0, Math.floor((now - startTime) / 1000));
        setDurationSeconds(elapsed);
      };

      updateElapsed();
      timerRef.current = setInterval(updateElapsed, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else if (currentCall && currentCall.ended_at) {
      // Fixed elapsed time when call ended
      const start = new Date(currentCall.started_at).getTime();
      const end = new Date(currentCall.ended_at).getTime();
      setDurationSeconds(Math.max(0, Math.floor((end - start) / 1000)));
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setDurationSeconds(0);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [currentCall?.status, currentCall?.started_at, currentCall?.ended_at]);

  // Load a call into active session
  const loadCall = useCallback(async (callId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const call = await api.getCallById(callId);
      setCurrentCall(call);
      setCurrentStageNumber(call.current_stage_number || 1);

      // Build stage results map
      const resultMap = new Map<number, CallStageResult>();
      if (call.stage_results) {
        call.stage_results.forEach(res => {
          resultMap.set(res.stage_number, res);
        });
      }
      setStageResults(resultMap);
      setAiSuggestion(null);
      return call;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load call details');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start a new call session
  const startNewCall = useCallback(async (prospectName = '', prospectCompany = '') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const newCall = await api.createCall({
        prospect_name: prospectName,
        prospect_company: prospectCompany
      });
      setCurrentCall(newCall);
      setCurrentStageNumber(1);
      setStageResults(new Map());
      setAiSuggestion(null);
      setDurationSeconds(0);
      return newCall;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start a new call');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Navigate to specific stage
  const navigateToStage = useCallback(async (stageNum: number) => {
    if (stageNum < 1 || stageNum > 8) return;
    setCurrentStageNumber(stageNum);
    setAiSuggestion(null);

    if (currentCall && currentCall.status === 'in_progress') {
      try {
        await api.updateCall(currentCall.id, { current_stage_number: stageNum });
        setCurrentCall(prev => prev ? { ...prev, current_stage_number: stageNum } : null);
      } catch (err) {
        console.warn('Failed to persist stage navigation:', err);
      }
    }
  }, [currentCall]);

  // Save current stage result
  const saveCurrentStage = useCallback(async (
    outcome: string,
    prospectWords: string,
    callerNotes = '',
    aiRecommendation?: string
  ) => {
    if (!currentCall) return null;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const saved = await api.saveStageResult(currentCall.id, currentStageNumber, {
        outcome,
        prospect_words: prospectWords,
        caller_notes: callerNotes,
        ai_recommendation: aiRecommendation
      });

      setStageResults(prev => {
        const next = new Map(prev);
        next.set(currentStageNumber, saved);
        return next;
      });

      return saved;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save stage result');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [currentCall, currentStageNumber]);

  // Request AI Copilot live guidance
  const requestAiGuidance = useCallback(async (
    outcome: string,
    prospectWords: string,
    callerNotes = ''
  ) => {
    if (!currentCall) return null;
    setIsAiLoading(true);
    setErrorMessage(null);
    try {
      const response = await api.getAiSuggestion(currentCall.id, {
        stage_number: currentStageNumber,
        outcome,
        prospect_words: prospectWords,
        caller_notes: callerNotes
      });
      setAiSuggestion(response);
      return response;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate AI guidance');
      throw err;
    } finally {
      setIsAiLoading(false);
    }
  }, [currentCall, currentStageNumber]);

  // End call early
  const endCallEarly = useCallback(async () => {
    if (!currentCall) return null;
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      const updated = await api.updateCall(currentCall.id, {
        status: 'ended_early',
        ended_at: now
      });
      setCurrentCall(updated);
      return updated;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to end call');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentCall]);

  // Complete call
  const completeCall = useCallback(async () => {
    if (!currentCall) return null;
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      const updated = await api.updateCall(currentCall.id, {
        status: 'completed',
        ended_at: now
      });
      setCurrentCall(updated);
      return updated;
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete call');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentCall]);

  const currentStageDef = getStageByNumber(currentStageNumber);
  const currentStageResult = stageResults.get(currentStageNumber);

  return {
    currentCall,
    currentStageNumber,
    currentStageDef,
    currentStageResult,
    stageResults,
    durationSeconds,
    aiSuggestion,
    isLoading,
    isSaving,
    isAiLoading,
    errorMessage,
    startNewCall,
    loadCall,
    navigateToStage,
    saveCurrentStage,
    requestAiGuidance,
    endCallEarly,
    completeCall,
    clearError: () => setErrorMessage(null),
    setAiSuggestion
  };
}
