# todos: react-foundation-homepage-sybdk5

Redesign of the marketing pages toward a neutral, primitive, Expo.dev-aligned look
(neutral gray surfaces, one blue accent, hairline borders, restrained shadows,
generous spacing, mono "eyebrow" section labels). Layout follows the provided
Figma screenshots; styling aligns with the attached Expo design system.

## Completed — Homepage (`/`) + shared chrome

- [x] `src/components/ui/react-atom.tsx` — theme-aware `currentColor` outline React atom
      (header, hero, footer). Replaces the filled cyan brand asset for the neutral look.
- [x] Header (`src/components/layout/header.tsx`) — single-line "The React Foundation"
      wordmark + atom, nav `News · About · Impact · Communities` with active states,
      theme toggle + hairline "Sign in" pill. Store/admin/auth logic preserved.
- [x] Mobile menu (`src/components/layout/mobile-menu.tsx`) — nav label `Updates → News`,
      reordered to match header.
- [x] Footer (`src/components/layout/footer.tsx`) — brand, link column
      (Home/Updates/Impact/Communities), social icons (X/GitHub/YouTube/Instagram),
      Linux Foundation copyright, bottom bar. Global (improves every page).
- [x] Hero (`foundation-hero.tsx`) — centered atom + heading + subhead + single
      "Get involved" CTA on a subtle neutral backdrop.
- [x] Community gallery (`community-gallery.tsx`) — tilted "moments" band. **Placeholder
      tiles** (gradient + label); swap for real event photos.
- [x] Members strip (`members-strip.tsx`) — "Meet our members" + founding-member logos,
      theme-adaptive monochrome (gray on light, white on dark).
- [x] Mission (`mission-statement.tsx`) — mono eyebrow + large statement + "Learn more".
- [x] Three pillars (`three-pillars.tsx`) — full-width Funding card w/ contributor-avatar
      grid, plus Education + Accessibility cards. Categorical accents: success/warning/primary.
- [x] Become a Contributor (`become-contributor.tsx`) — 2×2 grid, teal "Become a Member" card.
- [x] Join the Movement (`join-movement-cta.tsx`) — centered CTA.
- [x] Page (`src/app/page.tsx`) — composes the above; neutral top backdrop; generous rhythm.
- [x] `globals.css` — added missing `--warning` token (was referenced across the app but
      undefined, so `bg-warning`/`text-warning` were no-ops). Additive; `--warning-foreground`
      intentionally left undefined to avoid regressing admin usages.
- [x] Verified: `tsc --noEmit` clean; changed files lint-clean; light+dark, desktop+mobile
      screenshots reviewed.

## Deferred (need assets / decisions)

- [ ] Real community event photos for the gallery (currently placeholder tiles).
- [ ] Light-variant logos for **Callstack** and **Software Mansion** — their SVGs are
      white-only (built for dark bg), so they're excluded from the light members strip.
- [ ] Optional: retune `--primary` toward the Figma teal / Expo `blue-10` if the exact
      brand blue matters (kept the existing semantic `primary` = sky-500 for now).
- [ ] Optional: full migration of global tokens to the Radix scale from the Expo spec
      (kept blast radius small by reusing existing neutral tokens + component styling).

## Next steps (other pages from the screenshots, same neutral direction)

- [ ] About (`/about`) — hero, Executive Director message, Our Mission cards, How it works,
      Become a Contributor, "Ready to Make an Impact?" CTA.
- [ ] Communities (`/communities`) — "Find Your React Community" hero + stats + map + list.
- [ ] News/Updates (`/updates`) — "Latest news" + Follow/Subscribe + article cards.
