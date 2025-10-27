/**
 * Probe Repositories for Import Mentions
 *
 * Curated list of top React projects used to measure ecosystem adoption
 * by checking which libraries appear in their package.json dependencies.
 *
 * Selection criteria:
 * - 10k+ stars
 * - Actively maintained (commits in last 6 months)
 * - Uses modern React
 * - Representative of real-world usage
 *
 * Last updated: 2025-01
 */

export interface ProbeRepo {
  owner: string;
  repo: string;
  stars: number; // Approximate at time of listing
  category: 'framework' | 'ui-library' | 'app' | 'tool' | 'docs';
  description: string;
}

export const PROBE_REPOS: ProbeRepo[] = [
  // Major Frameworks
  { owner: 'vercel', repo: 'next.js', stars: 125000, category: 'framework', description: 'Next.js framework' },
  { owner: 'remix-run', repo: 'remix', stars: 29000, category: 'framework', description: 'Remix framework' },
  { owner: 'gatsbyjs', repo: 'gatsby', stars: 55000, category: 'framework', description: 'Gatsby framework' },
  { owner: 'expo', repo: 'expo', stars: 32000, category: 'framework', description: 'Expo React Native' },

  // UI Component Libraries
  { owner: 'mui', repo: 'material-ui', stars: 93000, category: 'ui-library', description: 'Material UI' },
  { owner: 'chakra-ui', repo: 'chakra-ui', stars: 38000, category: 'ui-library', description: 'Chakra UI' },
  { owner: 'ant-design', repo: 'ant-design', stars: 92000, category: 'ui-library', description: 'Ant Design' },
  { owner: 'radix-ui', repo: 'primitives', stars: 16000, category: 'ui-library', description: 'Radix Primitives' },
  { owner: 'adobe', repo: 'react-spectrum', stars: 13000, category: 'ui-library', description: 'React Spectrum' },
  { owner: 'tailwindlabs', repo: 'headlessui', stars: 26000, category: 'ui-library', description: 'Headless UI' },
  { owner: 'ariakit', repo: 'ariakit', stars: 8000, category: 'ui-library', description: 'Ariakit' },
  { owner: 'mantine-dev', repo: 'mantine', stars: 27000, category: 'ui-library', description: 'Mantine' },
  { owner: 'palantir', repo: 'blueprint', stars: 21000, category: 'ui-library', description: 'Blueprint' },
  { owner: 'react-bootstrap', repo: 'react-bootstrap', stars: 22000, category: 'ui-library', description: 'React Bootstrap' },
  { owner: 'segmentio', repo: 'evergreen', stars: 12000, category: 'ui-library', description: 'Evergreen UI' },

  // Major Applications
  { owner: 'calcom', repo: 'cal.com', stars: 32000, category: 'app', description: 'Cal.com scheduling' },
  { owner: 'supabase', repo: 'supabase', stars: 73000, category: 'app', description: 'Supabase dashboard' },
  { owner: 'vercel', repo: 'commerce', stars: 11000, category: 'app', description: 'Next.js Commerce' },
  { owner: 'PlasmoHQ', repo: 'plasmo', stars: 10000, category: 'app', description: 'Plasmo browser extension' },
  { owner: 'githubnext', repo: 'monaspace', stars: 14000, category: 'app', description: 'Monaspace site' },

  // Development Tools
  { owner: 'storybookjs', repo: 'storybook', stars: 84000, category: 'tool', description: 'Storybook' },
  { owner: 'vitejs', repo: 'vite', stars: 68000, category: 'tool', description: 'Vite' },
  { owner: 'facebook', repo: 'react-devtools', stars: 15000, category: 'tool', description: 'React DevTools' },
  { owner: 'welldone-software', repo: 'why-did-you-render', stars: 11000, category: 'tool', description: 'Why Did You Render' },

  // Documentation Sites
  { owner: 'reactjs', repo: 'react.dev', stars: 11000, category: 'docs', description: 'React docs' },
  { owner: 'typescript-cheatsheets', repo: 'react', stars: 45000, category: 'docs', description: 'React TypeScript Cheatsheet' },
  { owner: 'doczjs', repo: 'docz', stars: 23000, category: 'docs', description: 'Docz' },

  // Popular Open Source Apps
  { owner: 'novuhq', repo: 'novu', stars: 35000, category: 'app', description: 'Novu notifications' },
  { owner: 'twentyhq', repo: 'twenty', stars: 21000, category: 'app', description: 'Twenty CRM' },
  { owner: 'tldraw', repo: 'tldraw', stars: 36000, category: 'app', description: 'tldraw whiteboard' },
  { owner: 'raycast', repo: 'extensions', stars: 6000, category: 'app', description: 'Raycast extensions' },
  { owner: 'BuilderIO', repo: 'builder', stars: 7000, category: 'app', description: 'Builder.io' },
  { owner: 'excalidraw', repo: 'excalidraw', stars: 84000, category: 'app', description: 'Excalidraw' },
  { owner: 'refinedev', repo: 'refine', stars: 28000, category: 'framework', description: 'Refine framework' },
  { owner: 'TanStack', repo: 'tanstack.com', stars: 1500, category: 'docs', description: 'TanStack docs site' },
  { owner: 'withastro', repo: 'astro', stars: 47000, category: 'framework', description: 'Astro (supports React)' },
  { owner: 'trpc', repo: 'trpc', stars: 35000, category: 'framework', description: 'tRPC' },
  { owner: 'blitz-js', repo: 'blitz', stars: 14000, category: 'framework', description: 'Blitz.js' },
  { owner: 'redwoodjs', repo: 'redwood', stars: 17000, category: 'framework', description: 'RedwoodJS' },
];

/**
 * Get probe repos by category
 */
export function getProbeReposByCategory(category: ProbeRepo['category']): ProbeRepo[] {
  return PROBE_REPOS.filter(repo => repo.category === category);
}

/**
 * Get total number of probe repos
 */
export function getProbeRepoCount(): number {
  return PROBE_REPOS.length;
}

/**
 * Get probe repo key for caching
 */
export function getProbeRepoKey(owner: string, repo: string): string {
  return `${owner}/${repo}`;
}
