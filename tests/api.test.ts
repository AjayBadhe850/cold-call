import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../server/src/app';

const app = createApp();

describe('Cold-Call Assistant REST API Test Suite', () => {
  let createdCallId: string;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Health check endpoint test
  describe('GET /health', () => {
    it('should return 200 with service info, status ok, and no leaked secrets', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('cold-call-assistant-api');
      expect(res.body.version).toBe('1.0.0');
      expect(res.body.uptimeSeconds).toBeDefined();
      expect(res.body.database).toBeDefined();
      // Verify no sensitive keys leaked
      expect(res.body.apiKey).toBeUndefined();
      expect(res.body.serviceRoleKey).toBeUndefined();
    });
  });

  // 2. Call creation
  describe('POST /api/calls', () => {
    it('should create a new call record with default status and stage 1', async () => {
      const res = await request(app)
        .post('/api/calls')
        .send({
          prospect_name: 'Sarah Connor',
          prospect_company: 'Cyberdyne Systems'
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.prospect_name).toBe('Sarah Connor');
      expect(res.body.prospect_company).toBe('Cyberdyne Systems');
      expect(res.body.status).toBe('in_progress');
      expect(res.body.current_stage_number).toBe(1);
      expect(res.body.started_at).toBeDefined();
      expect(res.body.ended_at).toBeNull();

      createdCallId = res.body.id;
    });

    it('should create a call with empty/optional prospect details', async () => {
      const res = await request(app).post('/api/calls').send({});
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('in_progress');
    });

    it('should reject invalid input exceeding maximum allowed lengths', async () => {
      const res = await request(app)
        .post('/api/calls')
        .send({
          prospect_name: 'A'.repeat(300) // Exceeds 255
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.details).toBeDefined();
    });
  });

  // 3. Call history & retrieval
  describe('GET /api/calls and GET /api/calls/:id', () => {
    it('should list all saved calls ordered by creation date', async () => {
      const res = await request(app).get('/api/calls');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      const found = res.body.find((c: any) => c.id === createdCallId);
      expect(found).toBeDefined();
    });

    it('should retrieve specific call details with stage results', async () => {
      const res = await request(app).get(`/api/calls/${createdCallId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdCallId);
      expect(res.body.prospect_name).toBe('Sarah Connor');
      expect(Array.isArray(res.body.stage_results)).toBe(true);
    });

    it('should return 404 for a non-existent call UUID', async () => {
      const res = await request(app).get('/api/calls/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Call not found');
    });
  });

  // 4. Stage result saving and updating
  describe('PUT /api/calls/:id/stages/:stageNumber', () => {
    it('should save a valid stage result for stage 1', async () => {
      const res = await request(app)
        .put(`/api/calls/${createdCallId}/stages/1`)
        .send({
          outcome: 'permission_granted',
          prospect_words: 'I have about 30 seconds before my standup, make it quick.',
          caller_notes: 'Spoke clearly, sound interested in rep ramp time'
        });

      expect(res.status).toBe(200);
      expect(res.body.stage_number).toBe(1);
      expect(res.body.outcome).toBe('permission_granted');
      expect(res.body.prospect_words).toContain('30 seconds');
    });

    it('should update an existing stage result without duplicate rows', async () => {
      const res = await request(app)
        .put(`/api/calls/${createdCallId}/stages/1`)
        .send({
          outcome: 'hesitant_listening',
          prospect_words: 'Updated quote: What is this about?',
          caller_notes: 'Updated note'
        });

      expect(res.status).toBe(200);
      expect(res.body.outcome).toBe('hesitant_listening');
      expect(res.body.prospect_words).toContain('Updated quote');

      // Verify call has exactly 1 result for stage 1
      const callRes = await request(app).get(`/api/calls/${createdCallId}`);
      const stage1Results = callRes.body.stage_results.filter((s: any) => s.stage_number === 1);
      expect(stage1Results.length).toBe(1);
    });

    it('should reject invalid stage numbers (< 1 or > 8)', async () => {
      const resLow = await request(app)
        .put(`/api/calls/${createdCallId}/stages/0`)
        .send({ outcome: 'test' });
      expect(resLow.status).toBe(400);

      const resHigh = await request(app)
        .put(`/api/calls/${createdCallId}/stages/9`)
        .send({ outcome: 'test' });
      expect(resHigh.status).toBe(400);
    });

    it('should reject missing outcome field', async () => {
      const res = await request(app)
        .put(`/api/calls/${createdCallId}/stages/1`)
        .send({ prospect_words: 'some words' });
      expect(res.status).toBe(400);
    });
  });

  // 5. Call state updates (navigation, completion, early termination)
  describe('PATCH /api/calls/:id', () => {
    it('should update current stage number when caller navigates', async () => {
      const res = await request(app)
        .patch(`/api/calls/${createdCallId}`)
        .send({ current_stage_number: 2 });

      expect(res.status).toBe(200);
      expect(res.body.current_stage_number).toBe(2);
    });

    it('should allow ending call early with timestamp', async () => {
      const res = await request(app)
        .patch(`/api/calls/${createdCallId}`)
        .send({ status: 'ended_early' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ended_early');
      expect(res.body.ended_at).toBeDefined();
    });

    it('should allow marking call as completed', async () => {
      const res = await request(app)
        .patch(`/api/calls/${createdCallId}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('completed');
    });

    it('should return 404 when updating non-existent call', async () => {
      const res = await request(app)
        .patch('/api/calls/00000000-0000-0000-0000-000000000000')
        .send({ status: 'completed' });

      expect(res.status).toBe(404);
    });
  });

  // 6. AI Suggestion and Fallback handling
  describe('POST /api/calls/:id/ai-suggestion', () => {
    it('should return a validated structured recommendation (live LLM or methodology fallback)', async () => {
      const res = await request(app)
        .post(`/api/calls/${createdCallId}/ai-suggestion`)
        .send({
          stage_number: 1,
          outcome: 'permission_granted',
          prospect_words: 'I have 30 seconds, go ahead.',
          caller_notes: 'Tone was slightly hurried'
        });

      expect(res.status).toBe(200);
      expect(res.body.recommendedNextStage).toBeDefined();
      expect(res.body.suggestedScript).toBeDefined();
      expect(typeof res.body.suggestedScript).toBe('string');
      expect(res.body.rationale).toBeDefined();
      expect(res.body.confidence).toBeDefined();
      expect(typeof res.body.is_fallback).toBe('boolean');
      expect(res.body.provider).toBeDefined();
    });

    it('should detect objections in prospect words and suggest relevant counter in fallback mode', async () => {
      const res = await request(app)
        .post(`/api/calls/${createdCallId}/ai-suggestion`)
        .send({
          stage_number: 1,
          outcome: 'hesitant_listening',
          prospect_words: 'I am extremely busy right now with meetings'
        });

      expect(res.status).toBe(200);
      expect(res.body.suggestedScript).toContain('understand');
    });

    it('should reject invalid input payload to ai-suggestion', async () => {
      const res = await request(app)
        .post(`/api/calls/${createdCallId}/ai-suggestion`)
        .send({
          stage_number: 99, // invalid
          outcome: ''
        });

      expect(res.status).toBe(400);
    });
  });

  // 7. Call Summary generation
  describe('POST /api/calls/:id/summary', () => {
    it('should generate and save an executive summary for the call', async () => {
      const res = await request(app)
        .post(`/api/calls/${createdCallId}/summary`)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.summary).toBeDefined();
      expect(typeof res.body.summary).toBe('string');
      expect(Array.isArray(res.body.keyTakeaways)).toBe(true);

      // Verify the summary was persisted to the call record
      const callRes = await request(app).get(`/api/calls/${createdCallId}`);
      expect(callRes.body.summary).toBe(res.body.summary);
    });
  });
});
