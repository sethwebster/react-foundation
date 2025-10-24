import { z } from 'zod';

export const ChatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'tool', 'system']),
  content: z.string(),
  createdAt: z.string(),
  toolCallId: z.string().optional(),
  name: z.string().optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1),
  metadata: z
    .object({
      url: z.string().optional(),
      userAgent: z.string().optional(),
    })
    .optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export interface ChatResponse {
  conversationId: string;
  message: string;
  citations: Array<{
    id: string;
    source: string;
    score: number;
  }>;
  issue?: {
    url: string;
    number: number;
  };
  navigateTo?: string;
}

export interface RetrievalResult {
  id: string;
  source: string;
  score: number;
  content: string;
}
