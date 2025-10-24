import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import { logger } from '../logger';
import { getChatbotEnv } from './env';

const IssuePayloadSchema = z.object({
  title: z.string().min(5),
  body: z.string().min(20),
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
});

export type IssuePayload = z.infer<typeof IssuePayloadSchema>;

let client: Octokit | null = null;

function getOctokit(): Octokit {
  if (client) {
    return client;
  }

  const env = getChatbotEnv();

  client = new Octokit({
    auth: env.githubToken,
  });

  return client;
}

export async function createIssue(payload: IssuePayload): Promise<{ url: string; number: number }> {
  const env = getChatbotEnv();
  const input = IssuePayloadSchema.parse(payload);
  const octokit = getOctokit();

  const labels = new Set<string>(['from-chatbot', ...(input.labels ?? [])]);
  if (!input.labels || input.labels.length === 0) {
    labels.add('bug');
  }

  const assignees = input.assignees && input.assignees.length > 0 ? input.assignees : ['claude'];

  try {
    const response = await octokit.issues.create({
      owner: env.githubOwner,
      repo: env.githubRepo,
      title: input.title,
      body: input.body,
      labels: Array.from(labels),
      assignees,
    });

    logger.info('Chatbot created GitHub issue', {
      issue: response.data.number,
      url: response.data.html_url,
    });

    return {
      url: response.data.html_url,
      number: response.data.number,
    };
  } catch (error) {
    logger.error('Failed to create GitHub issue', error);
    throw new ChatbotIssueError('Unable to create GitHub issue', error);
  }
}

export class ChatbotIssueError extends Error {
  constructor(message: string, public details?: unknown) {
    super(message);
    this.name = 'ChatbotIssueError';
  }
}
