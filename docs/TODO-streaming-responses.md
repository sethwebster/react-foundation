# TODO: Enable Streaming Responses for Chatbot

## Current State

The chatbot currently uses **non-streaming responses** - it waits for the complete response before showing anything to the user.

### Why No Streaming?

**API Route** (`src/app/api/chat/route.ts:658-662`):
```typescript
const completion = await openai.chat.completions.create({
  model: getResponseModel(),
  messages: openaiMessages,
  tools,  // <-- Uses tool calls
});
// No `stream: true` parameter
```

**Frontend** (`SupportChat.tsx:182-192`):
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
const data = (await response.json()) as ChatResponse;
// Regular fetch expecting complete JSON
```

## The Challenge

The chatbot uses **tool calls** in an agentic loop:
- `search_site` - Vector search
- `create_github_issue` - File issues
- `navigate_site` - Page navigation
- `submit_handoff_request` - Human escalation
- `submit_community_listing` - Community submissions

**Complexity with streaming:**
1. OpenAI streams tool calls differently than regular text
2. The assistant might make multiple tool calls before the final answer
3. Need to pause streaming while tools execute
4. Need to resume streaming after tool results
5. Safety loop runs up to 5 iterations (line 656)

## Implementation Plan

### 1. API Route Changes (`/api/chat/route.ts`)

**Add streaming:**
```typescript
const completion = await openai.chat.completions.create({
  model: getResponseModel(),
  messages: openaiMessages,
  tools,
  stream: true,  // Enable streaming
});
```

**Return ReadableStream instead of JSON:**
```typescript
return new Response(
  new ReadableStream({
    async start(controller) {
      // Stream chunks here
    }
  }),
  {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  }
);
```

**Handle streaming with tool calls:**
```typescript
for await (const chunk of completion) {
  const delta = chunk.choices[0]?.delta;

  // Text content
  if (delta.content) {
    controller.enqueue(`data: ${JSON.stringify({
      type: 'content',
      delta: delta.content
    })}\n\n`);
  }

  // Tool calls
  if (delta.tool_calls) {
    // Pause stream, execute tools, resume
    controller.enqueue(`data: ${JSON.stringify({
      type: 'tool_call',
      name: delta.tool_calls[0].function.name
    })}\n\n`);
  }
}
```

### 2. Frontend Changes (`SupportChat.tsx`)

**Replace fetch with SSE handler:**
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));

      if (data.type === 'content') {
        // Update message incrementally
        setMessages(current =>
          current.map(msg =>
            msg.id === pendingId
              ? { ...msg, content: msg.content + data.delta }
              : msg
          )
        );
      }
    }
  }
}
```

### 3. Stream Event Types

```typescript
// Content delta
{ type: 'content', delta: 'text chunk' }

// Tool execution started
{ type: 'tool_call', name: 'search_site', status: 'running' }

// Tool execution completed
{ type: 'tool_result', name: 'search_site', status: 'done' }

// Stream complete
{ type: 'done', citations: [...], issue?: {...} }

// Error
{ type: 'error', message: 'error details' }
```

## Complexity Considerations

**Medium-High complexity:**
- Tool calls add significant complexity
- Need robust error handling for interrupted streams
- UI state management for partial responses
- Need to handle the agentic loop (up to 5 iterations)
- Citations and issue URLs come at the end

**Estimated time:** 2-3 hours

## UX Improvements from Streaming

- **Perceived performance** - User sees text appearing immediately
- **Engagement** - More interactive feel
- **Transparency** - Can show "Searching site..." when tools execute
- **Better loading states** - Shimmer during tool calls, text streaming during response

## Current Workaround

The shimmer effect on random thinking messages already provides good feedback:
- "Rendering virtual DOM…" ✨
- "useState is thinking…" ✨
- "Suspending disbelief…" ✨

## References

- OpenAI Streaming API: https://platform.openai.com/docs/api-reference/streaming
- Streaming with tool calls: https://platform.openai.com/docs/guides/function-calling
- Server-Sent Events (SSE): https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events

## Decision Needed

Should we implement streaming now, or is the current shimmer effect + random messages good enough for v1?

**Pros of implementing:**
- Better perceived performance
- More modern feel
- Can show tool execution status

**Pros of waiting:**
- Current UX is already pretty good with shimmer
- Significant complexity with tool calls
- Can iterate based on user feedback first
