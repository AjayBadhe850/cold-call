import { Request, Response, NextFunction } from 'express';
import { db } from '../services/database';
import { llmService } from '../services/llm';
import {
  createCallSchema,
  updateCallSchema,
  saveStageSchema,
  aiSuggestionRequestSchema
} from '../schemas/validation';
import { config, isSupabaseConfigured, isLlmConfigured } from '../config/env';

export const healthCheck = async (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'cold-call-assistant-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: isSupabaseConfigured() ? 'supabase' : 'fallback_memory',
    llmProvider: config.llm.provider,
    llmConfigured: isLlmConfigured(),
    uptimeSeconds: Math.floor(process.uptime())
  });
};

export const createCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = createCallSchema.parse(req.body);
    const newCall = await db.createCall({
      prospect_name: validated.prospect_name,
      prospect_company: validated.prospect_company
    });
    res.status(201).json(newCall);
  } catch (err) {
    next(err);
  }
};

export const listCalls = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const calls = await db.listCalls();
    res.status(200).json(calls);
  } catch (err) {
    next(err);
  }
};

export const getCallById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const call = await db.getCallById(id);
    if (!call) {
      res.status(404).json({ error: 'Call not found' });
      return;
    }
    res.status(200).json(call);
  } catch (err) {
    next(err);
  }
};

export const updateCall = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = updateCallSchema.parse(req.body);

    const existing = await db.getCallById(id);
    if (!existing) {
      res.status(404).json({ error: 'Call not found' });
      return;
    }

    // Automatically set ended_at if transitioning to completed or ended_early
    let endedAt = validated.ended_at;
    if (
      (validated.status === 'completed' || validated.status === 'ended_early') &&
      !existing.ended_at &&
      endedAt === undefined
    ) {
      endedAt = new Date().toISOString();
    }

    const updated = await db.updateCall(id, {
      ...validated,
      ended_at: endedAt
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const saveStageResult = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, stageNumber } = req.params;
    const num = parseInt(stageNumber, 10);
    if (isNaN(num) || num < 1 || num > 8) {
      res.status(400).json({ error: 'Invalid stage number. Must be an integer between 1 and 8.' });
      return;
    }

    const validated = saveStageSchema.parse(req.body);
    const existingCall = await db.getCallById(id);
    if (!existingCall) {
      res.status(404).json({ error: 'Call not found' });
      return;
    }

    const saved = await db.saveStageResult(id, num, validated);
    res.status(200).json(saved);
  } catch (err) {
    next(err);
  }
};

export const getAiSuggestion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const validated = aiSuggestionRequestSchema.parse(req.body);

    const call = await db.getCallById(id);
    if (!call) {
      res.status(404).json({ error: 'Call not found' });
      return;
    }

    const suggestion = await llmService.getStageSuggestion({
      stageNumber: validated.stage_number,
      outcome: validated.outcome,
      prospectWords: validated.prospect_words,
      callerNotes: validated.caller_notes,
      prospectName: call.prospect_name || undefined,
      prospectCompany: call.prospect_company || undefined
    });

    res.status(200).json(suggestion);
  } catch (err) {
    next(err);
  }
};

export const generateCallSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const call = await db.getCallById(id);
    if (!call) {
      res.status(404).json({ error: 'Call not found' });
      return;
    }

    const stageResults = await db.getStageResultsForCall(id);
    const summaryResult = await llmService.generateSummary(call, stageResults);

    // Persist summary into call record
    await db.updateCall(id, {
      summary: summaryResult.summary
    });

    res.status(200).json(summaryResult);
  } catch (err) {
    next(err);
  }
};
