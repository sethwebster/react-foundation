import OpenAI from 'openai';
import { getChatbotEnv } from './env';

let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (client) {
    return client;
  }

  const env = getChatbotEnv();

  client = new OpenAI({
    apiKey: env.openaiApiKey,
  });

  return client;
}

export function getResponseModel(): string {
  return getChatbotEnv().responseModel;
}

export function getEmbeddingModel(): string {
  return getChatbotEnv().embeddingModel;
}

export async function createEmbedding(text: string): Promise<number[]> {
  const client = getOpenAIClient();
  const model = getEmbeddingModel();

  const response = await client.embeddings.create({
    model,
    input: text,
  });

  return response.data[0].embedding;
}
