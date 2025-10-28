import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from 'openai/resources/chat/completions';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getOpenAIClient, getResponseModel, getEmbeddingModel } from '@/lib/chatbot/openai';
import { ensureVectorIndexIfMissing, searchSimilar } from '@/lib/chatbot/vector-store';
import { ChatbotIssueError, createIssue } from '@/lib/chatbot/github';
import { fileIssue } from '@/lib/github-bot';
import {
  appendMessage,
  createConversation,
  loadConversation,
  saveConversation,
  type ConversationState,
  type StoredMessage,
} from '@/lib/chatbot/store';
import { notifyHumanHandoff } from '@/lib/chatbot/handoff';
import { ChatRequestSchema, type ChatResponse, type RetrievalResult } from '@/lib/chatbot/types';
import { logger } from '@/lib/logger';
import { getRedisClient } from '@/lib/redis';
import { getChatbotEnv } from '@/lib/chatbot/env';

const NAVIGATION_TARGETS: Record<string, string> = {
  home: '/',
  about: '/about',
  impact: '/impact',
  updates: '/updates',
  store: '/store',
  collections: '/store#featured',
  drops: '/store#drops',
  communities: '/about#communities',
};

const SYSTEM_PROMPT = `
You are the React Foundation assistant, an expert helper that supports visitors to our website.
You are part of the Foundation - use "our" when referring to Foundation programs, mission, and work (e.g., "Our mission is...", "Our RIS system...").
Use only the supplied site context and your tools to answer.
Respond with concise, friendly language. You can and should use Markdown formatting in your responses:
- Use **bold** for emphasis
- Use bullet lists for multiple items
- Use [link text](url) for clickable links to external resources or documentation
- Use inline code with \`backticks\` for technical terms
DO NOT include citation markers like [source:...] in your response text - citations are shown separately below your message.
If you cannot find an answer in the documents, clearly say you do not know and offer to escalate.
When a user reports a potential bug, gather steps to reproduce, expected vs actual outcomes, and context before filing an issue.
When you have gathered enough information to create a GitHub issue, call create_github_issue to file it. Issues are always filed via the Foundation bot, with attribution to the user if they are authenticated.
If you cannot self-serve, ask for the visitor's best contact information, then call submit_handoff_request to notify our team.
When someone asks about adding a community, collect: community name, location/region, focus areas, primary links (website/join), meeting cadence, approximate size, and contact name/email before calling submit_community_listing. Confirm all details with the visitor first.
When a visitor explicitly wants to open a page (e.g., "take me to the impact page"), call navigate_site with the closest matching target or a safe path (anything starting with "/" except /admin).
If you already navigated the visitor, acknowledge it ("I'll take you there now") instead of asking for permission.
Never fabricate GitHub issues—only file when enough detail is provided and the report is actionable.
`;

const SearchToolSchema = z.object({
  query: z.string().min(3),
});

const IssueToolSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  reproduction_steps: z.array(z.string()).min(1),
  expected_result: z.string().nullable().optional(),
  actual_result: z.string().nullable().optional(),
  severity: z.enum(['low', 'medium', 'high']).optional(),
});

const HandoffToolSchema = z.object({
  contact: z.string().min(3, 'Contact information is required'),
  summary: z.string().min(5, 'Provide a short summary'),
  details: z.string().optional(),
});

const CommunitySubmissionToolSchema = z.object({
  name: z.string().min(2),
  summary: z.string().min(10),
  location: z.string().min(2),
  contactName: z.string().min(2).optional(),
  contactEmail: z.string().email(),
  primaryLink: z.string().url().optional(),
  joinLink: z.string().url().optional(),
  focusAreas: z.array(z.string()).min(1).optional(),
  meetingCadence: z.string().optional(),
  communitySize: z.string().optional(),
  communicationChannels: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
});

const NavigateToolSchema = z.object({
  target: z.string().min(1,
    'Provide either a known keyword (about, impact, updates, store, communities, etc.) or a site path like /impact').optional(),
  path: z.string().optional(),
});

interface HandleToolCallResult {
  messages: ChatCompletionMessageParam[];
  citations: RetrievalResult[];
  issue?: {
    url: string;
    number: number;
  };
  handoffReason?: string;
  handoffSubmitted?: boolean;
  navigationPath?: string;
}

function makeMessageId(): string {
  return randomBytes(10).toString('hex');
}

function buildTools(): ChatCompletionTool[] {
  return [
    {
      type: 'function',
      function: {
        name: 'search_site',
        description: 'Search the site knowledge base for the most relevant information.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The natural language search query.',
            },
          },
          required: ['query'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'create_github_issue',
        description:
          'Create a GitHub issue when a user reports a validated bug with clear reproduction steps. Issues are always filed via the Foundation bot, with attribution to the authenticated user if available.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            reproduction_steps: {
              type: 'array',
              items: { type: 'string' },
            },
            expected_result: { type: 'string' },
            actual_result: { type: 'string' },
            severity: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'Impact of the reported issue.',
            },
          },
          required: ['title', 'description', 'reproduction_steps'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'handoff_to_human',
        description: 'Trigger a handoff to the human support team when the assistant cannot help.',
        parameters: {
          type: 'object',
          properties: {
            reason: { type: 'string' },
          },
          required: ['reason'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'submit_handoff_request',
        description:
          'Send the visitor contact info and summary to the foundation team after you confirmed escalation.',
        parameters: {
          type: 'object',
          properties: {
            contact: { type: 'string', description: 'Visitor email or preferred contact method.' },
            summary: { type: 'string', description: 'Short summary of the request.' },
            details: { type: 'string', description: 'Any extra context to share with the team.' },
          },
          required: ['contact', 'summary'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'submit_community_listing',
        description:
          'Create a community submission using the details collected from the visitor for inclusion on the foundation communities page.',
        parameters: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Official name of the community.' },
            summary: { type: 'string', description: '1-3 sentence overview of the mission and audience.' },
            location: { type: 'string', description: 'Primary city/region the community serves.' },
            contactName: { type: 'string', description: 'Point of contact name.' },
            contactEmail: { type: 'string', description: 'Point of contact email.' },
            primaryLink: { type: 'string', description: 'Website or main landing page URL.' },
            joinLink: { type: 'string', description: 'Link where members can join (Discord, Meetup, etc).' },
            focusAreas: {
              type: 'array',
              items: { type: 'string' },
              description: 'Key focus areas or topics (e.g. education, meetups, hackathons).',
            },
            meetingCadence: { type: 'string', description: 'How often the community meets (weekly, monthly, etc).' },
            communitySize: { type: 'string', description: 'Approximate number of members or scale.' },
            communicationChannels: {
              type: 'array',
              items: { type: 'string' },
              description: 'Any additional communication channels (newsletter, Slack, etc).',
            },
            additionalNotes: { type: 'string', description: 'Anything else the team should know.' },
          },
          required: ['name', 'summary', 'location', 'contactEmail'],
        },
      },
    },
    {
      type: 'function',
      function: {
        name: 'navigate_site',
        description: 'Navigate the visitor to a known page or section on the foundation site.',
        parameters: {
          type: 'object',
          properties: {
            target: {
              type: 'string',
              description: 'One of: home, about, impact, updates, store, collections, drops, communities',
            },
          },
          required: ['target'],
        },
      },
    },
  ];
}

function formatIssueBody(payload: z.infer<typeof IssueToolSchema>, metadata: Record<string, unknown>) {
  const lines = [
    payload.description.trim(),
    '',
    '### Steps to reproduce',
    ...payload.reproduction_steps.map((step, index) => `${index + 1}. ${step}`),
  ];

  if (payload.expected_result) {
    lines.push('', '**Expected**', payload.expected_result);
  }
  if (payload.actual_result) {
    lines.push('', '**Actual**', payload.actual_result);
  }

  if (payload.severity) {
    lines.push('', `**Severity**: ${payload.severity}`);
  }

  lines.push('', '---', '');
  lines.push('cc @claude - This issue was created by the chatbot based on user feedback.');
  lines.push('', 'Chatbot metadata:');
  for (const [key, value] of Object.entries(metadata)) {
    if (value == null) continue;
    lines.push(`- ${key}: ${String(value)}`);
  }

  return lines.join('\n');
}

function formatCommunitySubmissionBody(
  data: z.infer<typeof CommunitySubmissionToolSchema>,
  options: {
    metadata: Record<string, unknown>;
    conversation: ConversationState;
  }
) {
  const lines = [
    '### Community overview',
    `- **Name:** ${data.name}`,
    `- **Location:** ${data.location}`,
    `- **Summary:** ${data.summary}`,
    data.primaryLink ? `- **Primary link:** ${data.primaryLink}` : '',
    data.joinLink ? `- **Join link:** ${data.joinLink}` : '',
    data.focusAreas && data.focusAreas.length
      ? `- **Focus areas:** ${data.focusAreas.join(', ')}`
      : '',
    data.meetingCadence ? `- **Meeting cadence:** ${data.meetingCadence}` : '',
    data.communitySize ? `- **Community size:** ${data.communitySize}` : '',
    data.communicationChannels && data.communicationChannels.length
      ? `- **Communication channels:** ${data.communicationChannels.join(', ')}`
      : '',
    '',
    '### Contact',
    data.contactName ? `- **Contact name:** ${data.contactName}` : '',
    `- **Contact email:** ${data.contactEmail}`,
    '',
  ].filter(Boolean);

  if (data.additionalNotes) {
    lines.push('### Additional notes', data.additionalNotes, '');
  }

  lines.push('---', '');
  lines.push('cc @claude - This community submission was created by the chatbot.');
  lines.push('', 'Chatbot metadata:');

  for (const [key, value] of Object.entries(options.metadata)) {
    if (value == null || value === '') continue;
    lines.push(`- ${key}: ${String(value)}`);
  }

  lines.push('', '### Conversation transcript');

  for (const message of options.conversation.messages) {
    lines.push(
      `- ${message.role.toUpperCase()}: ${message.content.substring(0, 2000)}`
    );
  }

  return lines.join('\n');
}

async function runModeration(input: string) {
  const openai = getOpenAIClient();
  const response = await openai.moderations.create({
    model: 'omni-moderation-latest',
    input,
  });

  const [result] = response.results;
  if (result?.flagged) {
    throw new Error('Message flagged by moderation');
  }
}

function toOpenAIMessages(stateMessages: ConversationState['messages']): ChatCompletionMessageParam[] {
  const results: ChatCompletionMessageParam[] = [];

  for (const message of stateMessages) {
    if (message.role === 'tool') {
      if (!message.toolCallId) {
        continue;
      }
      results.push({
        role: 'tool',
        tool_call_id: message.toolCallId,
        content: message.content,
      });
      continue;
    }

    results.push({
      role: message.role,
      content: message.content,
    });
  }

  return results;
}

async function handleToolCalls(
  toolCalls: ChatCompletionMessageToolCall[],
  redisClient: ReturnType<typeof getRedisClient>,
  options: {
    metadata: Record<string, unknown>;
    conversation: ConversationState;
    reason?: string;
    userGithubToken?: string;
    userGithubLogin?: string;
  }
): Promise<HandleToolCallResult> {
  const openai = getOpenAIClient();

  // Check if vector index is available
  try {
    await ensureVectorIndexIfMissing(redisClient);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('RediSearch') || message.includes('Redis Stack')) {
      logger.error('Redis Stack not available, vector search disabled');
      // Continue without vector search capability
    } else {
      throw error;
    }
  }

  const messages: ChatCompletionMessageParam[] = [];
  const citations: RetrievalResult[] = [];
  let issue: HandleToolCallResult['issue'];
  let handoffReason: string | undefined;
  let handoffSubmitted = false;
  let navigationPath: string | undefined;

  for (const toolCall of toolCalls) {
    if (toolCall.type !== 'function' || !toolCall.function) {
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify({ error: 'Unsupported tool call type' }),
      });
      continue;
    }

    const { name, arguments: args } = toolCall.function;

    if (name === 'search_site') {
      const input = SearchToolSchema.safeParse(JSON.parse(args || '{}'));
      if (!input.success) {
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: 'Invalid search payload' }),
        });
        continue;
      }

      const embeddingResponse = await openai.embeddings.create({
        model: getEmbeddingModel(),
        input: input.data.query,
      });
      const embedding = embeddingResponse.data[0].embedding;
      const results = await searchSimilar(redisClient, embedding, { k: 6 });
      citations.push(...results);

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify({
          results: results.map((result) => ({
            id: result.id,
            source: result.source,
            score: result.score,
            content: result.content,
          })),
        }),
      });
    } else if (name === 'create_github_issue') {
      const parsed = IssueToolSchema.safeParse(JSON.parse(args || '{}'));
      if (!parsed.success) {
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: 'Invalid issue payload' }),
        });
        continue;
      }

      const metadata = {
        ...options.metadata,
        created_at: new Date().toISOString(),
      };

      const body = formatIssueBody(parsed.data, metadata);

      try {
        // Always use the bot to file issues
        const env = getChatbotEnv();
        const result = await fileIssue({
          owner: env.githubOwner,
          repo: env.githubRepo,
          title: parsed.data.title,
          body,
          labels: ['bug', 'from-chatbot'],
          filedBy: options.userGithubLogin
            ? {
                username: options.userGithubLogin,
                name: options.userGithubLogin,
              }
            : undefined,
        });

        issue = {
          url: result.html_url,
          number: result.number,
        };

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            success: true,
            issue,
            createdAs: 'bot',
            attributedTo: options.userGithubLogin || 'anonymous',
          }),
        });
      } catch (error) {
        if (error instanceof ChatbotIssueError) {
          logger.error('Issue filing blocked', error.details ?? error.message);
        } else {
          logger.error('Unexpected issue filing error', error);
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ success: false, error: 'issue_failed' }),
        });
      }
    } else if (name === 'submit_community_listing') {
      const parsed = CommunitySubmissionToolSchema.safeParse(JSON.parse(args || '{}'));
      if (!parsed.success) {
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: 'Invalid community payload' }),
        });
        continue;
      }

      const metadata = {
        ...options.metadata,
        created_at: new Date().toISOString(),
      } as Record<string, unknown>;

      const body = formatCommunitySubmissionBody(parsed.data, {
        metadata,
        conversation: options.conversation,
      });

      try {
        const result = await createIssue({
          title: `Community submission: ${parsed.data.name}`,
          body,
          labels: ['community-submission'],
          // Don't assign to anyone by default - let GitHub notifications handle it
        });

        issue = result;

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ success: true, issue: result }),
        });
      } catch (error) {
        if (error instanceof ChatbotIssueError) {
          logger.error('Community submission failed', error.details ?? error.message);
        } else {
          logger.error('Unexpected community submission error', error);
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ success: false, error: 'issue_failed' }),
        });
      }
    } else if (name === 'navigate_site') {
      const parsed = NavigateToolSchema.safeParse(JSON.parse(args || '{}'));
      if (!parsed.success) {
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: 'Invalid navigation payload' }),
        });
        continue;
      }

      const resolved = resolveNavigationTarget(parsed.data.target ?? parsed.data.path ?? '');
      if (!resolved) {
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: 'Unknown navigation target' }),
        });
        continue;
      }

      navigationPath = resolved;
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify({ success: true, path: resolved }),
      });
    } else if (name === 'handoff_to_human') {
      const payload = JSON.parse(args || '{}') as { reason?: string };
      logger.warn('Chatbot requested human handoff', payload);
      handoffReason = payload.reason;
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify({ acknowledged: true }),
      });
    } else if (name === 'submit_handoff_request') {
      const parsed = HandoffToolSchema.safeParse(JSON.parse(args || '{}'));
      if (!parsed.success) {
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ error: 'Invalid handoff payload' }),
        });
        continue;
      }

      try {
        await notifyHumanHandoff({
          conversation: options.conversation,
          contact: parsed.data.contact,
          summary: parsed.data.summary,
          details: parsed.data.details,
          reason: options.reason ?? handoffReason,
          metadata: options.metadata,
        });
        handoffSubmitted = true;
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ success: true }),
        });
      } catch (error) {
        logger.error('Failed to send handoff notification', error);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({ success: false, error: 'Notification failed' }),
        });
      }
    } else {
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify({ error: `Unknown tool ${name}` }),
      });
    }
  }

  return { messages, citations, issue, handoffReason, handoffSubmitted, navigationPath };
}

export async function POST(request: NextRequest) {
  try {
    // Get user session to check if they're authenticated with GitHub
    const session = await getServerSession(authOptions);
    const userGithubToken = session?.accessToken;
    const userGithubLogin = session?.user?.githubLogin;

    const json = await request.json();
    const parsed = ChatRequestSchema.safeParse(json);

    if (!parsed.success) {
      logger.warn('Chatbot request validation failed', {
        body: json,
        errors: parsed.error.flatten(),
      });
      return NextResponse.json(
        { error: 'Invalid request payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    await runModeration(data.message);

    let conversation: ConversationState | null = null;
    if (data.conversationId) {
      conversation = await loadConversation(data.conversationId);
    }

    if (!conversation) {
      conversation = createConversation(data.conversationId);
    }

    const userMessage: StoredMessage = {
      id: makeMessageId(),
      role: 'user' as const,
      content: data.message,
      createdAt: new Date().toISOString(),
      metadata: {
        url: data.metadata?.url,
        userAgent: data.metadata?.userAgent,
      },
    };
    conversation = appendMessage(conversation, userMessage);

    // Build system prompt with user authentication context
    let systemPrompt = SYSTEM_PROMPT;
    if (userGithubLogin) {
      systemPrompt += `\n\nCONTEXT: The user is authenticated with GitHub as @${userGithubLogin}. You can personalize responses and attribute GitHub issues to them.`;
    } else {
      systemPrompt += '\n\nCONTEXT: The user is not authenticated. GitHub issues will be filed anonymously via the Foundation bot.';
    }

    const openaiMessages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...toOpenAIMessages(conversation.messages),
    ];

    const openai = getOpenAIClient();
    const tools = buildTools();
    const redisClient = getRedisClient();

    const metadata = {
      url: data.metadata?.url,
      userAgent: data.metadata?.userAgent,
      conversationId: conversation.id,
    };

    const citations: RetrievalResult[] = [];
    let issue: ChatResponse['issue'];
    let safetyCounter = 0;
    let assistantContent = '';
    let handoffReason: string | undefined;
    let handoffSubmitted = false;
    let navigationPath: string | undefined;

    while (safetyCounter < 5) {
      safetyCounter += 1;
      const completion = await openai.chat.completions.create({
        model: getResponseModel(),
        messages: openaiMessages,
        tools,
      });

      const choice = completion.choices[0];
      const message = choice.message;

      if (message.tool_calls?.length) {
        openaiMessages.push({
          role: 'assistant',
          content: message.content ?? '',
          tool_calls: message.tool_calls,
        });
        const toolResult = await handleToolCalls(message.tool_calls, redisClient, {
          metadata,
          conversation,
          reason: handoffReason,
          userGithubToken,
          userGithubLogin,
        });
        citations.push(...toolResult.citations);
        if (toolResult.issue) {
          issue = toolResult.issue;
        }
        if (toolResult.handoffReason) {
          handoffReason = toolResult.handoffReason;
        }
        if (toolResult.handoffSubmitted) {
          handoffSubmitted = true;
        }
        if (toolResult.navigationPath) {
          navigationPath = toolResult.navigationPath;
        }
        openaiMessages.push(...toolResult.messages);
        continue;
      }

      assistantContent = message.content ?? '';
      openaiMessages.push({
        role: 'assistant',
        content: assistantContent,
      });
      break;
    }

    if (!assistantContent) {
      if (handoffSubmitted) {
        assistantContent =
          'Thanks! I just passed this along to the foundation team. You should hear back soon.';
      } else if (handoffReason) {
        assistantContent =
          'Thanks for reaching out! I want to make sure the right person follows up. Could you drop the best email or contact info so the foundation team can get back to you?';
      } else {
        throw new Error('Assistant did not return content');
      }
    }

    const assistantMessage: StoredMessage = {
      id: makeMessageId(),
      role: 'assistant' as const,
      content: assistantContent,
      createdAt: new Date().toISOString(),
    };
    conversation = appendMessage(conversation, assistantMessage);
    await saveConversation(conversation);

    const response: ChatResponse = {
      conversationId: conversation.id,
      message: assistantContent,
      citations: dedupeCitations(citations),
      issue,
      navigateTo: navigationPath,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof Error && error.message === 'Message flagged by moderation') {
      return NextResponse.json(
        { error: 'Message violates content policy.' },
        { status: 403 }
      );
    }

    logger.error('Chatbot chat handler failed', error);
    return NextResponse.json(
      { error: 'Chatbot unavailable. Please try again later.' },
      { status: 500 }
    );
  }
}

function dedupeCitations(citations: RetrievalResult[]): ChatResponse['citations'] {
  const map = new Map<string, RetrievalResult>();
  for (const citation of citations) {
    if (!map.has(citation.id) || map.get(citation.id)!.score > citation.score) {
      map.set(citation.id, citation);
    }
  }
  return Array.from(map.values())
    .filter((item) => isPublicSource(item.source))
    .map((item) => ({
      id: item.id,
      source: item.source,
      score: item.score,
    }));
}

function isPublicSource(source: string): boolean {
  // Show citations for:
  // 1. Public site paths from ingestion (start with /)
  // 2. Content/docs/README files
  // 3. Exclude admin paths
  if (source.startsWith('/')) {
    return !source.startsWith('/admin') && !source.startsWith('/api');
  }

  return (
    source.startsWith('content/') ||
    source.startsWith('docs/') ||
    source.startsWith('README') ||
    source.startsWith('public/') ||
    source.startsWith('src/app/')
  );
}

function resolveNavigationTarget(target: string): string | undefined {
  const normalized = target?.trim().toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (NAVIGATION_TARGETS[normalized]) {
    return NAVIGATION_TARGETS[normalized];
  }

  if (normalized.startsWith('/')) {
    if (!normalized.startsWith('/admin')) {
      return normalized;
    }
    return undefined;
  }

  // handle phrasing like "impact page" -> "impact"
  const cleaned = normalized.replace(/\s+page$/, '');
  if (NAVIGATION_TARGETS[cleaned]) {
    return NAVIGATION_TARGETS[cleaned];
  }

  return undefined;
}
