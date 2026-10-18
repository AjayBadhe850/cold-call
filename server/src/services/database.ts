import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { config, isSupabaseConfigured } from '../config/env';
import { CallRecord, CallStageResult, CallStatus } from '@shared/types';

export interface DatabaseService {
  isUsingFallback(): boolean;
  createCall(data: { prospect_name?: string; prospect_company?: string }): Promise<CallRecord>;
  listCalls(): Promise<CallRecord[]>;
  getCallById(id: string): Promise<CallRecord | null>;
  updateCall(id: string, data: { status?: CallStatus; current_stage_number?: number; summary?: string; ended_at?: string | null }): Promise<CallRecord | null>;
  saveStageResult(callId: string, stageNumber: number, data: { outcome: string; prospect_words: string; caller_notes?: string; ai_recommendation?: string }): Promise<CallStageResult>;
  getStageResultsForCall(callId: string): Promise<CallStageResult[]>;
}

/**
 * In-Memory Database Fallback
 * Guarantees 100% functionality and persistence during local testing / offline environments
 * before Supabase credentials are configured.
 */
class MemoryDatabaseService implements DatabaseService {
  private calls: Map<string, CallRecord> = new Map();
  private stageResults: Map<string, CallStageResult[]> = new Map(); // callId -> results

  isUsingFallback(): boolean {
    return true;
  }

  async createCall(data: { prospect_name?: string; prospect_company?: string }): Promise<CallRecord> {
    const now = new Date().toISOString();
    const newCall: CallRecord = {
      id: crypto.randomUUID(),
      prospect_name: data.prospect_name || '',
      prospect_company: data.prospect_company || '',
      status: 'in_progress',
      current_stage_number: 1,
      started_at: now,
      ended_at: null,
      summary: null,
      created_at: now,
      updated_at: now,
      stage_results: []
    };
    this.calls.set(newCall.id, newCall);
    this.stageResults.set(newCall.id, []);
    return newCall;
  }

  async listCalls(): Promise<CallRecord[]> {
    const list = Array.from(this.calls.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    // Attach stage results count / data
    return list.map(c => ({
      ...c,
      stage_results: this.stageResults.get(c.id) || []
    }));
  }

  async getCallById(id: string): Promise<CallRecord | null> {
    const call = this.calls.get(id);
    if (!call) return null;
    return {
      ...call,
      stage_results: this.stageResults.get(id) || []
    };
  }

  async updateCall(
    id: string,
    data: { status?: CallStatus; current_stage_number?: number; summary?: string; ended_at?: string | null }
  ): Promise<CallRecord | null> {
    const call = this.calls.get(id);
    if (!call) return null;

    const updated: CallRecord = {
      ...call,
      ...data,
      updated_at: new Date().toISOString()
    };
    this.calls.set(id, updated);
    return {
      ...updated,
      stage_results: this.stageResults.get(id) || []
    };
  }

  async saveStageResult(
    callId: string,
    stageNumber: number,
    data: { outcome: string; prospect_words: string; caller_notes?: string; ai_recommendation?: string }
  ): Promise<CallStageResult> {
    const call = this.calls.get(callId);
    if (!call) throw new Error('Call not found');

    const results = this.stageResults.get(callId) || [];
    const now = new Date().toISOString();
    const existingIndex = results.findIndex(r => r.stage_number === stageNumber);

    const stageRecord: CallStageResult = {
      id: existingIndex >= 0 ? results[existingIndex].id : crypto.randomUUID(),
      call_id: callId,
      stage_number: stageNumber,
      outcome: data.outcome,
      prospect_words: data.prospect_words || '',
      caller_notes: data.caller_notes || '',
      ai_recommendation: data.ai_recommendation || null,
      created_at: existingIndex >= 0 ? results[existingIndex].created_at : now,
      updated_at: now
    };

    if (existingIndex >= 0) {
      results[existingIndex] = stageRecord;
    } else {
      results.push(stageRecord);
    }

    results.sort((a, b) => a.stage_number - b.stage_number);
    this.stageResults.set(callId, results);

    // Update parent call updated_at
    call.updated_at = now;
    this.calls.set(callId, call);

    return stageRecord;
  }

  async getStageResultsForCall(callId: string): Promise<CallStageResult[]> {
    return this.stageResults.get(callId) || [];
  }
}

/**
 * Supabase Database Implementation
 * Uses the official PostgreSQL connection via Supabase Client with service role key
 */
class SupabaseDatabaseService implements DatabaseService {
  private client: SupabaseClient;

  constructor(url: string, serviceRoleKey: string) {
    this.client = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  isUsingFallback(): boolean {
    return false;
  }

  async createCall(data: { prospect_name?: string; prospect_company?: string }): Promise<CallRecord> {
    const { data: call, error } = await this.client
      .from('calls')
      .insert({
        prospect_name: data.prospect_name || null,
        prospect_company: data.prospect_company || null,
        status: 'in_progress',
        current_stage_number: 1
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database error creating call: ${error.message}`);
    }

    return {
      ...call,
      stage_results: []
    };
  }

  async listCalls(): Promise<CallRecord[]> {
    const { data: calls, error } = await this.client
      .from('calls')
      .select('*, stage_results:call_stage_results(*)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Database error listing calls: ${error.message}`);
    }

    return (calls || []).map(c => ({
      ...c,
      stage_results: c.stage_results || []
    }));
  }

  async getCallById(id: string): Promise<CallRecord | null> {
    const { data: call, error } = await this.client
      .from('calls')
      .select('*, stage_results:call_stage_results(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Database error fetching call: ${error.message}`);
    }
    if (!call) return null;

    if (call.stage_results && Array.isArray(call.stage_results)) {
      call.stage_results.sort((a: CallStageResult, b: CallStageResult) => a.stage_number - b.stage_number);
    }

    return call;
  }

  async updateCall(
    id: string,
    data: { status?: CallStatus; current_stage_number?: number; summary?: string; ended_at?: string | null }
  ): Promise<CallRecord | null> {
    const updatePayload: Record<string, unknown> = {};
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.current_stage_number !== undefined) updatePayload.current_stage_number = data.current_stage_number;
    if (data.summary !== undefined) updatePayload.summary = data.summary;
    if (data.ended_at !== undefined) updatePayload.ended_at = data.ended_at;

    const { data: updated, error } = await this.client
      .from('calls')
      .update(updatePayload)
      .eq('id', id)
      .select('*, stage_results:call_stage_results(*)')
      .maybeSingle();

    if (error) {
      throw new Error(`Database error updating call: ${error.message}`);
    }
    return updated || null;
  }

  async saveStageResult(
    callId: string,
    stageNumber: number,
    data: { outcome: string; prospect_words: string; caller_notes?: string; ai_recommendation?: string }
  ): Promise<CallStageResult> {
    const { data: stageRecord, error } = await this.client
      .from('call_stage_results')
      .upsert(
        {
          call_id: callId,
          stage_number: stageNumber,
          outcome: data.outcome,
          prospect_words: data.prospect_words || '',
          caller_notes: data.caller_notes || '',
          ai_recommendation: data.ai_recommendation || null
        },
        { onConflict: 'call_id,stage_number' }
      )
      .select('*')
      .single();

    if (error) {
      throw new Error(`Database error saving stage result: ${error.message}`);
    }

    return stageRecord;
  }

  async getStageResultsForCall(callId: string): Promise<CallStageResult[]> {
    const { data: results, error } = await this.client
      .from('call_stage_results')
      .select('*')
      .eq('call_id', callId)
      .order('stage_number', { ascending: true });

    if (error) {
      throw new Error(`Database error fetching stage results: ${error.message}`);
    }

    return results || [];
  }
}

// Instantiate the singleton database service
let dbInstance: DatabaseService;

if (isSupabaseConfigured()) {
  try {
    dbInstance = new SupabaseDatabaseService(config.supabase.url, config.supabase.serviceRoleKey);
    console.log('[Database] Connected to Supabase PostgreSQL at', config.supabase.url);
  } catch (err) {
    console.error('[Database] Failed to connect to Supabase. Falling back to in-memory store:', err);
    dbInstance = new MemoryDatabaseService();
  }
} else {
  console.log('[Database] Supabase credentials not set. Using persistent in-memory repository for local evaluation.');
  dbInstance = new MemoryDatabaseService();
}

export const db = dbInstance;
