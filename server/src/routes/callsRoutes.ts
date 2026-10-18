import { Router } from 'express';
import {
  createCall,
  listCalls,
  getCallById,
  updateCall,
  saveStageResult,
  getAiSuggestion,
  generateCallSummary
} from '../controllers/callsController';

const router = Router();

// /api/calls
router.post('/', createCall);
router.get('/', listCalls);

// /api/calls/:id
router.get('/:id', getCallById);
router.patch('/:id', updateCall);

// /api/calls/:id/stages/:stageNumber
router.put('/:id/stages/:stageNumber', saveStageResult);

// /api/calls/:id/ai-suggestion
router.post('/:id/ai-suggestion', getAiSuggestion);

// /api/calls/:id/summary
router.post('/:id/summary', generateCallSummary);

export default router;
