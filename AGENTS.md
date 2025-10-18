# Repository Guidelines

## Project Structure & Module Organization
Keep application code inside `src/`, grouped by feature. Each feature folder (for example `src/features/catalog`) should contain its React components, state hooks, and slice-specific tests. Shared UI stays in `src/components/ui`, layout primitives in `src/components/layout`, and cross-cutting utilities in `src/lib`. Place static assets such as fonts or images in `public/`. Keep shared state helpers in `src/store` and prefer environment-specific configuration helpers in `config/`.

## Build, Test, and Development Commands
Run `npm install` after cloning to sync dependencies. Use `npm run dev` to start the development server with hot reloading. Build production assets through `npm run build`, and review the bundle locally with `npm run preview`. Execute `npm run lint` before pushing to catch formatting and lint issues, and rely on `npm test` for the unit suite configured in `package.json`.

## Coding Style & Naming Conventions
Prefer TypeScript for new modules and keep files using PascalCase for components (`ProductGrid.tsx`), camelCase for hooks and utilities (`useCart.ts`), and kebab-case for directories. Prefer feature-first files so related logic stays co-located. Components use functional React syntax with hooks; avoid class components. Enforce 2-space indentation, trailing commas, and semi-colons. Keep CSS Modules or SCSS files named after their components (`ProductGrid.module.scss`).

## Testing Guidelines
Write unit tests beside the module using the `*.test.ts(x)` suffix. Focus on rendering logic, hooks, and store slices; mock network calls with MSW fixtures under `tests/mocks`. For integration coverage, add Playwright or Cypress specs in `tests/e2e` and prefix files with the feature name (`cart.checkout.spec.ts`). Target branch coverage above 80% and add regression tests for each bug fix referencing the issue number in the test description.

## Commit & Pull Request Guidelines
Use Conventional Commits (`feat:`, `fix:`, `chore:`) so changelog automation remains consistent. Each pull request should include a concise summary, testing notes (commands executed and results), and screenshots or GIFs for UI-facing work. Link related GitHub issues in the description and note any configuration changes (new env vars, migrations). Keep PRs scoped to a single feature or fix; if something feels unrelated, split it into a follow-up branch.

## Security & Configuration Tips
Never commit `.env` files; rely on `.env.example` to document required keys. Rotate API tokens in the deployment platform and capture the change in the PR. When adding dependencies, prefer audited packages and run `npm audit` before merging. Review bundle output for secrets with `npm run build` prior to release.
