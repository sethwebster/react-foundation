// Browser-safe `process` for the design-system bundle.
//
// Why this exists: several RFDS components transitively import app modules
// that read server configuration at module scope (process.env.NEXTAUTH_*,
// SHOPIFY_*, VERCEL_*, NEXT_*). The converter's bundler targets the browser
// and defines only process.env.NODE_ENV, so every one of those reads threw
// `ReferenceError: process is not defined` during module init — which killed
// the IIFE before it could assign window.RFDS, and therefore broke all 67
// component previews at once, not just the ones touching auth or Shopify.
//
// This is imported FIRST from .design-sync/ds-entry.ts. ES modules evaluate
// their imports in source order, so this runs before any component module's
// initializer. Reads resolve to undefined rather than crashing, which is the
// correct behaviour for a preview: there is no server, and no component should
// need real credentials to render.
//
// NOTE (see .design-sync/NOTES.md): the deeper issue is that presentational
// RFDS components reach server config through their import graph at all. That
// is an app-architecture fix, out of scope for the design-system sync.
const g = globalThis as unknown as { process?: Record<string, unknown> };

g.process ??= {};
g.process.env ??= { NODE_ENV: 'development' };
g.process.platform ??= 'browser';
g.process.version ??= '';
g.process.nextTick ??= (fn: (...a: unknown[]) => void, ...args: unknown[]) => {
  void Promise.resolve().then(() => fn(...args));
};

export {};
