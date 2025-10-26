# Foundation Chatbot Implementation Plan

> **Status (in progress)** — Backend API, Redis vector store ingestion, and frontend widget are implemented behind the `NEXT_PUBLIC_ENABLE_CHATBOT` flag. Remaining work: configure Redis backups, add rate limiting + analytics, wire CI job for embeddings, expand test coverage.

## 1. Vision & Success Metrics
- **Primary goal**: provide accurate, conversational answers about the foundation using the entire public site as context, and streamline bug reporting to GitHub.
- **Key outcomes**: 80%+ helpfulness rating in post-chat surveys, <5% hallucination rate (manual review), <2 minute median time-to-issue for bug reports, stakeholder satisfaction (CS + Eng + Comms).
- **Non-goals**: live human handoff, supporting private donor data, proactive outreach.

## 2. Stakeholder Alignment & Governance
- **Stakeholders**: Foundation comms (content accuracy), Engineering (platform ownership), Support (issue triage), Security (data handling), Claude triage team.
- **Kick-off actions**: requirements workshop, content coverage audit, draft moderation/escalation policy, agree on SLAs for issue responses.
- **Governance**: fortnightly review of chat transcripts + issue backlog; change-management checklist for new content or tooling.

## 3. Architecture Overview
- **Frontend**: floating widget (`src/features/support-chat`) renders React client component, streams responses, posts chats to backend.
- **Backend**: Next.js App Router API route `/api/chat` orchestrates sessions, OpenAI calls, vector retrieval, and tool invocations.
- **Data**: Redis Stack stores embeddings + metadata (RediSearch vector index) and conversation state (`chatbot:conversation:*`).
- **Integrations**: OpenAI Chat Completions + embeddings for inference; Octokit for GitHub; Sentry/DataDog for telemetry (future work).
- **Hosting**: Widget served with existing Next.js deployment; embedding job invoked locally or via CI using `npm run chatbot:index`.

## 4. Knowledge Ingestion & Retrieval
- **Sources**: Markdown/MDX in `content/`, structured JSON in `data/`, supplemental context in `public-context/`, and static pages rendered from `src/app`.
- **Pipeline**:
  1. CI job (`.github/workflows/embed-site-content.yml`) runs on `main` deploy + nightly.
  2. Script `scripts/index-site-content.ts` loads markdown/MDX content, normalizes to plain text, chunks (~1,000 chars with overlap), and stores in Redis (`chatbot:chunk:*`). It now indexes `content/`, `data/`, `public-context/`, and every `src/app/**/page.tsx` outside of admin routes while explicitly ignoring `docs/`.
  3. Embeddings created via `text-embedding-3-large` and stored alongside metadata (source path, URL, last commit hash).
  4. Change detection: compare latest git commit hash per source file; only re-embed changed files to limit cost.
  5. Recovery: failed batches retried; pipeline posts summary to Slack/Sentry.
- **Retrieval**: HNSW vector search via RediSearch; apply metadata filters (future); send top-k + citations into OpenAI system prompt; include last 3 user/assistant exchanges for memory.

## 5. Conversational Backend
- **Session management**: anonymous conversation ID stored in Redis (`chatbot:conversation:*`) with 7-day TTL.
- **Request flow**:
  1. Frontend sends user message to `/api/chat`.
  2. Rate limiter (e.g., Upstash Redis or Postgres advisory locks) enforces IP/user quotas.
  3. Run moderation check via `omni-moderation-latest`; reject or sanitize unsafe inputs.
  4. Retrieve context chunks; call OpenAI `responses.create` with function definitions (`searchSite`, `createGithubIssue`, `handoffToHuman`).
  5. Stream deltas back to client; persist final assistant message + citations.
- **Fallbacks**: on low confidence (score < threshold) call `handoffToHuman` to notify support; show friendly fallback.
- **Fallbacks**: on low confidence (score < threshold) call `handoff_to_human`, capture visitor contact info, and send Resend email via `submit_handoff_request` to admin inbox.

## 6. GitHub Issue Automation
- **Flow**:
  1. LLM triggers `createGithubIssue` tool with structured payload (title, description, repro steps, environment).
  2. Server validates payload: sentiment, length, dedupe by hashing key fields, confirm bug intent.
  3. Enrich with session metadata (page URL, timestamp, user agent) and link to chat transcript.
  4. Use Octokit (`src/lib/chatbot/github.ts`) to file issue in foundation repo with labels `bug`, `from-chatbot`, assign `claude`.
  5. Community submissions: `submit_community_listing` collects name, location, focus areas, links, contact info and creates an issue labeled `community-submission`.
  6. Post confirmation back to user; persist issue metadata alongside the conversation.
- **Human oversight**: optional flag to require approval Slack notification for high-risk components; daily digest of new issues to Claude team.
- **Error handling**: retries with exponential backoff; if GitHub fails, store pending issue for manual review.

## 7. Frontend Widget
- **Component**: `<SupportChat />` React component; uses portal to append to `document.body` with bottom-right positioning; responsive layout (mobile full-width sheet).
- **Features**: minimize/expand, conversation persistence (localStorage fallback tied to session), typing indicators, quick action buttons (FAQ, “Report an Issue”), cite sources with tooltip links, render Markdown responses (links, lists, code), support multiline input with Shift+Enter, and respond to navigation requests by deep-linking to key site pages.
- **Accessibility**: keyboard focus trap, aria-live regions, color contrast respect site theming; respect reduced-motion preference.
- **Analytics**: track open rate, completion, issue submissions via existing analytics pipeline.

## 8. Security, Privacy & Compliance
- **Secrets**: manage `OPENAI_API_KEY`, `GITHUB_TOKEN`, `DATABASE_URL` via environment variables documented in `.env.example`; never expose client-side.
- **Escalations**: require `ADMIN_EMAIL` (comma-separated allowed) and `RESEND_*` vars so human handoffs notify the team automatically.
- **Data retention**: redact personal data before logging; define retention window (e.g., 90 days) and automated cleanup job.
- **Moderation**: enforce OpenAI moderation before LLM call; block disallowed categories; escalate flagged content to Security.
- **Rate limiting & abuse prevention**: (todo) add per-session + IP throttle; captcha challenge if thresholds exceeded.
- **Auditability**: structured logs with request IDs; Sentry traces for errors and slow responses.

## 9. Testing Strategy
- **Unit**: ingestion parsers, vector store queries, GitHub payload formatting, moderation guard.
- **Integration**: mocked OpenAI + Redis to test end-to-end chat flow; issue creation path; regression tests for known bugs (tie to issue IDs).
- **E2E**: Playwright scenario for widget (desktop + mobile), verifying streaming responses and issue filing.
- **Load/Chaos**: k6 or Artillery to simulate traffic; verify rate limits and degradation handling.
- **Release gates**: `npm run lint`, `npm test`, optional preview deploy smoke tests.

## 10. Rollout Plan
- **Phase 0**: finalize requirements, secure Redis Stack instance + access controls, confirm support process.
- **Phase 1**: build ingestion + embeddings pipeline (`npm run chatbot:index`); validate retrieval quality with SMEs; adjust chunking.
- **Phase 2**: implement chat API + widget; internal beta behind feature flag (`NEXT_PUBLIC_ENABLE_CHATBOT`).
- **Phase 3**: enable GitHub tool behind separate flag; run with manual approval, monitor noise.
- **Phase 4**: GA launch; set up monitoring dashboards; schedule retro after two weeks.

## 11. Open Questions & Next Steps
- **Open questions**: preferred analytics stack? GDPR/CCPA implications for chat transcripts? Do we require SSO for staff-only responses? Who owns issue triage calendar?
- **Immediate actions**:
  1. Schedule stakeholder workshop and assign DRI.
  2. Harden Redis index lifecycle (backups, index rebuild strategy).
  3. Draft CI workflow to run `npm run chatbot:index` on deploy.
  4. Spec API contract between widget and `/api/chat` (done).
