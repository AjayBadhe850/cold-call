import { createApp } from './app';
import { config } from './config/env';

const app = createApp();

app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Cold-Call Assistant Backend running on port ${config.port}`);
  console.log(`📡 Environment: ${config.nodeEnv}`);
  console.log(`🏥 Health Check: http://localhost:${config.port}/health`);
  console.log(`🤖 LLM Provider: ${config.llm.provider} (${config.llm.model})`);
  console.log(`🌐 Allowed CORS: ${config.frontendOrigin}`);
  console.log(`=======================================================`);
});
