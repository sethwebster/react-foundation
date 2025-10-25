/**
 * Libraries Loader
 * Loads tracked React ecosystem library data
 * Based on AUTO_INGESTION_SETUP.md specification
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import type { ContentLoader, RawRecord } from '../types';
import { logger } from '@/lib/logger';

/**
 * Library data structure from ECOSYSTEM_LIBRARIES.md
 */
interface LibraryData {
  repo: string; // e.g., "facebook/react"
  name: string; // e.g., "React"
  category: string; // e.g., "Core React"
  tier: string; // e.g., "Tier 1 (Critical Infrastructure)"
  description?: string;
}

export class LibrariesLoader implements ContentLoader {
  name = 'LibrariesLoader';

  private libraries: LibraryData[] = [
    // Core React & React Native (9 repositories)
    { repo: 'facebook/react', name: 'React', category: 'Core React', tier: 'Tier 1' },
    { repo: 'facebook/react-native', name: 'React Native', category: 'Core React', tier: 'Tier 1' },
    { repo: 'facebook/hermes', name: 'Hermes', category: 'Core React', tier: 'Tier 1' },
    { repo: 'reactjs/react.dev', name: 'React Documentation', category: 'Core React', tier: 'Tier 1' },
    { repo: 'reactjs/rfcs', name: 'React RFCs', category: 'Core React', tier: 'Tier 1' },
    { repo: 'react-navigation/react-navigation', name: 'React Navigation', category: 'Core React', tier: 'Tier 1' },
    { repo: 'facebook/jest', name: 'Jest', category: 'Core React', tier: 'Tier 1' },
    { repo: 'facebook/relay', name: 'Relay', category: 'Core React', tier: 'Tier 1' },
    { repo: 'react-native-community/react-native-releases', name: 'React Native Releases', category: 'Core React', tier: 'Tier 2' },

    // State Management (6 repositories)
    { repo: 'reduxjs/redux', name: 'Redux', category: 'State Management', tier: 'Tier 1' },
    { repo: 'reduxjs/redux-toolkit', name: 'Redux Toolkit', category: 'State Management', tier: 'Tier 1' },
    { repo: 'pmndrs/zustand', name: 'Zustand', category: 'State Management', tier: 'Tier 2' },
    { repo: 'pmndrs/jotai', name: 'Jotai', category: 'State Management', tier: 'Tier 2' },
    { repo: 'pmndrs/valtio', name: 'Valtio', category: 'State Management', tier: 'Tier 2' },
    { repo: 'statelyai/xstate', name: 'XState', category: 'State Management', tier: 'Tier 2' },

    // Data Fetching (5 repositories)
    { repo: 'TanStack/query', name: 'TanStack Query', category: 'Data Fetching', tier: 'Tier 1' },
    { repo: 'vercel/swr', name: 'SWR', category: 'Data Fetching', tier: 'Tier 1' },
    { repo: 'apollographql/apollo-client', name: 'Apollo Client', category: 'Data Fetching', tier: 'Tier 1' },
    { repo: 'trpc/trpc', name: 'tRPC', category: 'Data Fetching', tier: 'Tier 2' },
    { repo: 'urql-graphql/urql', name: 'urql', category: 'Data Fetching', tier: 'Tier 2' },

    // Routing (3 repositories)
    { repo: 'remix-run/react-router', name: 'React Router', category: 'Routing', tier: 'Tier 1' },
    { repo: 'TanStack/router', name: 'TanStack Router', category: 'Routing', tier: 'Tier 2' },
    { repo: 'molefrog/wouter', name: 'Wouter', category: 'Routing', tier: 'Tier 3' },

    // Meta-frameworks (5 repositories)
    { repo: 'vercel/next.js', name: 'Next.js', category: 'Meta-frameworks', tier: 'Tier 1' },
    { repo: 'remix-run/remix', name: 'Remix', category: 'Meta-frameworks', tier: 'Tier 1' },
    { repo: 'expo/expo', name: 'Expo', category: 'Meta-frameworks', tier: 'Tier 1' },
    { repo: 'gatsbyjs/gatsby', name: 'Gatsby', category: 'Meta-frameworks', tier: 'Tier 2' },
    { repo: 'withastro/astro', name: 'Astro', category: 'Meta-frameworks', tier: 'Tier 2' },

    // Forms & Validation (5 repositories)
    { repo: 'react-hook-form/react-hook-form', name: 'React Hook Form', category: 'Forms & Validation', tier: 'Tier 1' },
    { repo: 'colinhacks/zod', name: 'Zod', category: 'Forms & Validation', tier: 'Tier 1' },
    { repo: 'jaredpalmer/formik', name: 'Formik', category: 'Forms & Validation', tier: 'Tier 2' },
    { repo: 'jquense/yup', name: 'Yup', category: 'Forms & Validation', tier: 'Tier 2' },
    { repo: 'final-form/react-final-form', name: 'React Final Form', category: 'Forms & Validation', tier: 'Tier 3' },

    // Testing (4 repositories)
    { repo: 'testing-library/react-testing-library', name: 'React Testing Library', category: 'Testing', tier: 'Tier 1' },
    { repo: 'vitest-dev/vitest', name: 'Vitest', category: 'Testing', tier: 'Tier 1' },
    { repo: 'microsoft/playwright', name: 'Playwright', category: 'Testing', tier: 'Tier 1' },
    { repo: 'testing-library/react-hooks-testing-library', name: 'React Hooks Testing Library', category: 'Testing', tier: 'Tier 2' },

    // UI/Component Libraries (6 repositories)
    { repo: 'radix-ui/primitives', name: 'Radix UI', category: 'UI Libraries', tier: 'Tier 1' },
    { repo: 'tailwindlabs/headlessui', name: 'Headless UI', category: 'UI Libraries', tier: 'Tier 1' },
    { repo: 'mui/material-ui', name: 'Material-UI', category: 'UI Libraries', tier: 'Tier 1' },
    { repo: 'adobe/react-spectrum', name: 'React Spectrum', category: 'UI Libraries', tier: 'Tier 2' },
    { repo: 'ariakit/ariakit', name: 'Ariakit', category: 'UI Libraries', tier: 'Tier 2' },
    { repo: 'chakra-ui/chakra-ui', name: 'Chakra UI', category: 'UI Libraries', tier: 'Tier 2' },

    // Animation (3 repositories)
    { repo: 'framer/motion', name: 'Framer Motion', category: 'Animation', tier: 'Tier 1' },
    { repo: 'pmndrs/react-spring', name: 'React Spring', category: 'Animation', tier: 'Tier 2' },
    { repo: 'formkit/auto-animate', name: 'AutoAnimate', category: 'Animation', tier: 'Tier 3' },

    // Dev Tools & Bundling (5 repositories)
    { repo: 'storybookjs/storybook', name: 'Storybook', category: 'Dev Tools', tier: 'Tier 1' },
    { repo: 'vitejs/vite', name: 'Vite', category: 'Dev Tools', tier: 'Tier 1' },
    { repo: 'facebook/react-devtools', name: 'React DevTools', category: 'Dev Tools', tier: 'Tier 1' },
    { repo: 'facebook/metro', name: 'Metro', category: 'Dev Tools', tier: 'Tier 2' },
    { repo: 'vercel/turbo', name: 'Turbo', category: 'Dev Tools', tier: 'Tier 2' },

    // Data Tables (1 repository)
    { repo: 'TanStack/table', name: 'TanStack Table', category: 'Data Tables', tier: 'Tier 1' },

    // Styling (2 repositories)
    { repo: 'styled-components/styled-components', name: 'styled-components', category: 'Styling', tier: 'Tier 1' },
    { repo: 'emotion-js/emotion', name: 'Emotion', category: 'Styling', tier: 'Tier 1' },
  ];

  async load(): Promise<RawRecord[]> {
    logger.info(`[${this.name}] Loading ${this.libraries.length} tracked libraries`);

    const records: RawRecord[] = [];

    for (const lib of this.libraries) {
      try {
        const slug = lib.repo.replace('/', '-').toLowerCase();

        // Build body text from library data
        const body = this.buildLibraryBody(lib);

        // Create record
        const record: RawRecord = {
          id: `library-${slug}`,
          type: 'library',
          title: lib.name,
          url: `/libraries#${slug}`,
          updatedAt: new Date().toISOString(),
          tags: {
            repo: lib.repo,
            category: lib.category,
            tier: lib.tier,
          },
          body,
          anchors: [
            { text: 'Overview', anchor: `#${slug}` },
            { text: 'Contribute', anchor: `#${slug}-contribute` },
          ],
        };

        records.push(record);
      } catch (error) {
        logger.error(`[${this.name}] Failed to load library ${lib.repo}:`, error);
      }
    }

    logger.info(`[${this.name}] Loaded ${records.length} libraries successfully`);
    return records;
  }

  /**
   * Build searchable text body from library data
   */
  private buildLibraryBody(lib: LibraryData): string {
    const parts: string[] = [];

    parts.push(`# ${lib.name}`);
    parts.push(`GitHub Repository: ${lib.repo}`);
    parts.push(`Category: ${lib.category}`);
    parts.push(`Tier: ${lib.tier}`);

    // Add description if available
    if (lib.description) {
      parts.push(`\n## Overview\n${lib.description}`);
    }

    // Add contribution info
    parts.push(`\n## Contributing`);
    parts.push(`This library is tracked for React Foundation contributor recognition.`);
    parts.push(`Contributions to this library earn points:`);
    parts.push(`- Pull Requests: 8 points`);
    parts.push(`- Issues: 3 points`);
    parts.push(`- Commits: 1 point`);
    parts.push(`\nContribute at: https://github.com/${lib.repo}`);

    // Add RIS info
    parts.push(`\n## React Impact Score`);
    parts.push(`This library is part of the React Impact Score (RIS) system.`);
    parts.push(`Maintainers of this library receive quarterly funding based on their impact across:`);
    parts.push(`- Ecosystem Footprint (30%): Downloads, dependents, usage`);
    parts.push(`- Contribution Quality (25%): PR quality, issue resolution`);
    parts.push(`- Maintainer Health (20%): Team sustainability`);
    parts.push(`- Community Benefit (15%): Documentation, support`);
    parts.push(`- Mission Alignment (10%): Accessibility, performance, security`);

    return parts.join('\n');
  }
}
