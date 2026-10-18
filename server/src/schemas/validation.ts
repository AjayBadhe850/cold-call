import { z } from 'zod';

export const createCallSchema = z.object({
  prospect_name: z.string().trim().max(255).optional().default(''),
  prospect_company: z.string().trim().max(255).optional().default('')
});

export const updateCallSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'ended_early']).optional(),
  current_stage_number: z.number().int().min(1).max(8).optional(),
  summary: z.string().max(2000).optional(),
  ended_at: z.string().datetime().nullable().optional()
});

export const saveStageSchema = z.object({
  outcome: z.string().trim().min(1, 'Outcome is required').max(120),
  prospect_words: z.string().max(5000).optional().default(''),
  caller_notes: z.string().max(5000).optional().default(''),
  ai_recommendation: z.string().max(5000).optional()
});

export const aiSuggestionRequestSchema = z.object({
  stage_number: z.coerce.number().int().min(1).max(8),
  outcome: z.string().trim().min(1),
  prospect_words: z.string().max(5000).optional().default(''),
  caller_notes: z.string().max(5000).optional().default('')
});

export const structuredAiSuggestionSchema = z.object({
  recommendedNextStage: z.union([z.number().int().min(1).max(8), z.literal('completed'), z.literal('ended_early')]),
  nextStepLabel: z.string(),
  suggestedScript: z.string(),
  rationale: z.string(),
  detectedObjection: z.string().nullable().optional(),
  confidence: z.enum(['high', 'medium', 'low']).default('high')
});

export const structuredSummarySchema = z.object({
  summary: z.string(),
  keyTakeaways: z.array(z.string()),
  nextSteps: z.string()
});
