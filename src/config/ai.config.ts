import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  openaiApiKey: process.env.OPENAI_API_KEY,
  langchainApiKey: process.env.LANGCHAIN_API_KEY,
}));
