import dotenv from 'dotenv';
import path from 'path';

// Load .env from root or server directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },
  llm: {
    provider: (process.env.LLM_PROVIDER || 'gemini').toLowerCase(),
    apiKey: process.env.LLM_API_KEY || '',
    model: process.env.LLM_MODEL || 'gemini-2.5-flash'
  }
};

export const isSupabaseConfigured = (): boolean => {
  return Boolean(config.supabase.url && config.supabase.serviceRoleKey);
};

export const isLlmConfigured = (): boolean => {
  return Boolean(config.llm.apiKey && config.llm.apiKey.trim().length > 5);
};
