/**
 * Shared Type Definitions for Cold-Call Assistant
 * Used by both React Frontend and Express Backend for 100% Type Safety
 */

export type CallStatus = 'in_progress' | 'completed' | 'ended_early';

export interface CallRecord {
  id: string;
  prospect_name: string | null;
  prospect_company: string | null;
  status: CallStatus;
  current_stage_number: number;
  started_at: string;
  ended_at: string | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
  stage_results?: CallStageResult[];
}

export interface CallStageResult {
  id?: string;
  call_id: string;
  stage_number: number;
  outcome: string;
  prospect_words: string;
  caller_notes: string;
  ai_recommendation?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StageOutcomeOption {
  value: string;
  label: string;
  description: string;
  recommendedNextStage?: number;
  terminatesCall?: boolean;
  isSuccessPath?: boolean;
}

export interface StageObjection {
  objection: string;
  suggestedResponse: string;
  tip?: string;
}

export interface ColdCallStageDefinition {
  stageNumber: number;
  name: string;
  title: string;
  tagline: string;
  purpose: string;
  callerObjective: string;
  talkingPoints: string[];
  exampleProspectResponses: string[];
  objections: StageObjection[];
  outcomes: StageOutcomeOption[];
  defaultNextStage: number;
}

export interface CreateCallPayload {
  prospect_name?: string;
  prospect_company?: string;
}

export interface UpdateCallPayload {
  status?: CallStatus;
  current_stage_number?: number;
  summary?: string;
  ended_at?: string | null;
}

export interface SaveStagePayload {
  outcome: string;
  prospect_words: string;
  caller_notes?: string;
  ai_recommendation?: string;
}

export interface AiSuggestionRequest {
  stage_number: number;
  outcome: string;
  prospect_words: string;
  caller_notes?: string;
}

export interface AiSuggestionResponse {
  recommendedNextStage: number | 'completed' | 'ended_early';
  nextStepLabel: string;
  suggestedScript: string;
  rationale: string;
  detectedObjection?: string | null;
  confidence: 'high' | 'medium' | 'low';
  is_fallback: boolean;
  provider: string;
  fallback_reason?: string;
}

export interface CallSummaryResponse {
  summary: string;
  keyTakeaways: string[];
  nextSteps: string;
  is_fallback: boolean;
  provider: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  timestamp: string;
  database: 'supabase' | 'fallback_memory';
  llmProvider: string;
  llmConfigured: boolean;
  uptimeSeconds: number;
}
