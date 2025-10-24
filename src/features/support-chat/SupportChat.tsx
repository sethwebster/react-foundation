'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type JSX,
} from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

type Role = 'user' | 'assistant' | 'system';

interface Citation {
  id: string;
  source: string;
  score: number;
}

interface UIMessage {
  id: string;
  role: Role;
  content: string;
  status?: 'loading' | 'error';
  citations?: Citation[];
  issueUrl?: string;
}

interface ChatResponse {
  conversationId: string;
  message: string;
  citations: Citation[];
  issue?: {
    url: string;
    number: number;
  };
  navigateTo?: string;
}

const INITIAL_MESSAGES: UIMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      "Hi! I'm the Foundation assistant. Ask about our programs, funding model, or let me know if something looks off and I can help file a GitHub issue.",
  },
];

const markdownComponents: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-cyan-200 underline-offset-2 hover:underline"
    >
      {children}
    </a>
  ),
  p: ({ children }) => (
    <p className="mb-2 whitespace-pre-wrap last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => <ul className="mb-2 list-disc pl-5 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="mb-1">{children}</li>,
  code: ({ inline, children }: ComponentPropsWithoutRef<'code'> & { inline?: boolean }) =>
    inline ? (
      <code className="rounded bg-white/10 px-1 py-0.5 text-[0.85em]">{children}</code>
    ) : (
      <code className="block rounded-md bg-black/70 px-3 py-2 text-xs">{children}</code>
    ),
};

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
}

export function SupportChat(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) return;
    const container = scrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    const nextHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${nextHeight}px`;
  }, [input, isOpen]);

  const suggestions = useMemo(
    () => [
      {
        id: 'impact',
        label: 'How do donations get used?',
        prompt: 'How does the foundation distribute funding across maintainers?',
      },
      {
        id: 'apply',
        label: 'Can I apply for funding?',
        prompt: 'What is the process for maintainers to apply for funding support?',
      },
      {
        id: 'bug',
        label: 'Report an issue',
        prompt: 'I found a bug on the site: ',
      },
    ],
    []
  );

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setInput('');

    const userMessage: UIMessage = {
      id: makeId(),
      role: 'user',
      content: trimmed,
    };

    const pendingId = makeId();
    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: pendingId,
        role: 'assistant',
        content: 'Thinking…',
        status: 'loading',
      },
    ]);

    try {
      const payload: Record<string, unknown> = {
        message: trimmed,
        metadata: {
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      };

      if (conversationId) {
        payload.conversationId = conversationId;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as ChatResponse;
      setConversationId(data.conversationId);

      setMessages((current) =>
        current.map((message) =>
          message.id === pendingId
            ? {
                id: pendingId,
                role: 'assistant',
                content: data.message,
                citations: data.citations,
                issueUrl: data.issue?.url,
              }
            : message
        )
      );

      if (data.navigateTo) {
        router.push(data.navigateTo);
      }
    } catch (error) {
      const fallback =
        error instanceof Error ? error.message : 'Something went wrong.';
      setMessages((current) =>
        current.map((message) =>
          message.id === pendingId
            ? {
                ...message,
                content:
                  'Sorry, I ran into a problem responding. Please try again shortly.',
                status: 'error',
              }
            : message
        )
      );
      console.error('Chat request failed', fallback);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendMessage();
  }

  async function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await sendMessage();
    }
  }

  function handleSuggestion(prompt: string) {
    setIsOpen(true);
    setInput(prompt);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 px-2">
      {isOpen && (
        <div
          className={cn(
            'flex w-full max-w-[360px] flex-col gap-3 rounded-2xl border border-white/10 bg-black/90 p-4 text-sm shadow-2xl shadow-cyan-500/20 backdrop-blur',
            'max-h-[75vh] overflow-hidden',
            'max-[480px]:fixed max-[480px]:bottom-2 max-[480px]:left-2 max-[480px]:right-2 max-[480px]:top-2 max-[480px]:max-w-none'
          )}
          role="dialog"
          aria-label="Foundation support chat"
        >
          <header className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div>
              <p className="text-sm font-semibold text-white">Foundation chat</p>
              <p className="text-xs text-white/60">
                Ask a question or report a site issue.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white"
            >
              Close
            </Button>
          </header>

          <div
            ref={scrollRef}
            className="chat-scroll flex min-h-[200px] flex-1 flex-col gap-3 overflow-y-auto pr-2"
          >
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
          </div>

          <div className="border-t border-white/10 pt-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80 transition hover:border-cyan-400/60 hover:text-white"
                  type="button"
                  onClick={() => handleSuggestion(suggestion.prompt)}
                >
                  {suggestion.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <label className="sr-only" htmlFor="support-chat-input">
                Message
              </label>
              <textarea
                id="support-chat-input"
                ref={textareaRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about the foundation..."
                rows={1}
                className="flex-1 resize-none rounded-2xl border border-white/15 bg-black/60 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-transparent"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting || !input.trim()}
              >
                Send
              </Button>
            </form>
            <p className="mt-2 text-[11px] text-white/40">
              Conversations are logged for quality review. Sensitive or personal
              information is removed automatically.
            </p>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="primary"
        size="sm"
        className="rounded-full shadow-xl shadow-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/40"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        aria-controls="support-chat-panel"
      >
        {isOpen ? 'Hide chat' : 'Need help?'}
      </Button>
    </div>
  );
}

function ChatBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user';
  const bubbleClasses = isUser
    ? 'self-end bg-cyan-500 text-black'
    : 'self-start bg-white/10 text-white';

  return (
    <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-lg',
          bubbleClasses,
          message.status === 'loading' && 'animate-pulse bg-white/5 text-white/60',
          message.status === 'error' && 'border border-red-400/40 text-red-100'
        )}
      >
        {message.status === 'loading' ? (
          message.content
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
      {message.citations && message.citations.length > 0 && (
        <ul className="flex flex-wrap gap-2 text-[11px] text-white/50">
          {message.citations.map((citation) => (
            <li key={citation.id} className="rounded-full border border-white/15 px-2 py-0.5">
              {citation.source}
            </li>
          ))}
        </ul>
      )}
      {message.issueUrl && (
        <a
          href={message.issueUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-cyan-300 underline-offset-2 hover:underline"
        >
          View the GitHub issue
        </a>
      )}
    </div>
  );
}
