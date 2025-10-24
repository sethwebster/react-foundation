import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import { getRedisClient } from '../redis';

const MESSAGE_SCHEMA = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'tool', 'system']),
  content: z.string(),
  createdAt: z.string(),
  toolCallId: z.string().optional(),
  name: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type StoredMessage = z.infer<typeof MESSAGE_SCHEMA>;

export interface ConversationState {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredMessage[];
}

const CONVERSATION_SCHEMA = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  messages: z.array(MESSAGE_SCHEMA),
});

function getConversationKey(id: string): string {
  return `chatbot:conversation:${id}`;
}

export async function loadConversation(id: string): Promise<ConversationState | null> {
  const redis = getRedisClient();
  const raw = await redis.get(getConversationKey(id));
  if (!raw) return null;

  const parsed = CONVERSATION_SCHEMA.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return null;
  }

  return parsed.data;
}

export async function saveConversation(state: ConversationState): Promise<void> {
  const redis = getRedisClient();
  const key = getConversationKey(state.id);
  await redis.set(key, JSON.stringify(state), 'EX', 60 * 60 * 24 * 7);
}

export function createConversationId(): string {
  return randomBytes(16).toString('hex');
}

export function createConversation(id?: string): ConversationState {
  const now = new Date().toISOString();
  return {
    id: id ?? createConversationId(),
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

export function appendMessage(state: ConversationState, message: StoredMessage): ConversationState {
  const now = new Date().toISOString();

  const MAX_MESSAGES = 20;
  const messages = [...state.messages, message];
  const trimmed =
    messages.length > MAX_MESSAGES ? messages.slice(messages.length - MAX_MESSAGES) : messages;

  return {
    ...state,
    updatedAt: now,
    messages: trimmed,
  };
}
