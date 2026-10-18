import {
  CallRecord,
  CallStageResult,
  CreateCallPayload,
  UpdateCallPayload,
  SaveStagePayload,
  AiSuggestionRequest,
  AiSuggestionResponse,
  CallSummaryResponse,
  HealthCheckResponse
} from '@shared/types';

// In production on Vercel, VITE_API_BASE_URL points to the deployed Render backend.
// In local dev, Vite proxies /api and /health to http://localhost:5000.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`;
    let details;
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
      details = data.details;
    } catch {
      // Ignore JSON parse error on non-JSON response
    }
    throw new ApiError(errorMsg, res.status, details);
  }
  return res.json();
}

export const api = {
  async checkHealth(): Promise<HealthCheckResponse> {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<HealthCheckResponse>(res);
  },

  async createCall(payload: CreateCallPayload): Promise<CallRecord> {
    const res = await fetch(`${API_BASE_URL}/api/calls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<CallRecord>(res);
  },

  async listCalls(): Promise<CallRecord[]> {
    const res = await fetch(`${API_BASE_URL}/api/calls`);
    return handleResponse<CallRecord[]>(res);
  },

  async getCallById(id: string): Promise<CallRecord> {
    const res = await fetch(`${API_BASE_URL}/api/calls/${id}`);
    return handleResponse<CallRecord>(res);
  },

  async updateCall(id: string, payload: UpdateCallPayload): Promise<CallRecord> {
    const res = await fetch(`${API_BASE_URL}/api/calls/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<CallRecord>(res);
  },

  async saveStageResult(callId: string, stageNumber: number, payload: SaveStagePayload): Promise<CallStageResult> {
    const res = await fetch(`${API_BASE_URL}/api/calls/${callId}/stages/${stageNumber}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<CallStageResult>(res);
  },

  async getAiSuggestion(callId: string, payload: AiSuggestionRequest): Promise<AiSuggestionResponse> {
    const res = await fetch(`${API_BASE_URL}/api/calls/${callId}/ai-suggestion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse<AiSuggestionResponse>(res);
  },

  async generateSummary(callId: string): Promise<CallSummaryResponse> {
    const res = await fetch(`${API_BASE_URL}/api/calls/${callId}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse<CallSummaryResponse>(res);
  }
};
