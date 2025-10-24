import { getOptionalEnvVar, getRequiredEnvVar } from '../env';

type EmbeddingModel = 'text-embedding-3-large' | 'text-embedding-3-small';

const EMBEDDING_DIMENSIONS: Record<EmbeddingModel, number> = {
  'text-embedding-3-large': 3072,
  'text-embedding-3-small': 1536,
};

export interface ChatbotEnv {
  openaiApiKey: string;
  responseModel: string;
  embeddingModel: EmbeddingModel;
  redisIndex: string;
  redisPrefix: string;
  githubOwner: string;
  githubRepo: string;
  githubToken: string;
}

export function getChatbotEnv(): ChatbotEnv {
  const embeddingModel = getOptionalEnvVar(
    'OPENAI_EMBEDDING_MODEL',
    'text-embedding-3-large'
  ) as EmbeddingModel;

  if (!(embeddingModel in EMBEDDING_DIMENSIONS)) {
    throw new Error(
      `Unsupported embedding model "${embeddingModel}". ` +
      `Supported models: ${Object.keys(EMBEDDING_DIMENSIONS).join(', ')}`
    );
  }

  return {
    openaiApiKey: getRequiredEnvVar('OPENAI_API_KEY'),
    responseModel: getOptionalEnvVar('OPENAI_RESPONSE_MODEL', 'gpt-4.1-mini'),
    embeddingModel,
    redisIndex: getOptionalEnvVar('CHATBOT_REDIS_INDEX', 'idx:chatbot:chunks'),
    redisPrefix: getOptionalEnvVar('CHATBOT_REDIS_PREFIX', 'chatbot:chunk:'),
    githubOwner: getRequiredEnvVar('CHATBOT_GITHUB_OWNER'),
    githubRepo: getRequiredEnvVar('CHATBOT_GITHUB_REPO'),
    githubToken: getRequiredEnvVar('GITHUB_TOKEN'),
  };
}

export function getEmbeddingDimensions(model: EmbeddingModel): number {
  return EMBEDDING_DIMENSIONS[model];
}
