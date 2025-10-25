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
    // Core React
    { repo: 'facebook/react', name: 'React', category: 'Core React', tier: 'Tier 1' },
    { repo: 'facebook/react-native', name: 'React Native', category: 'Core React', tier: 'Tier 1' },
    { repo: 'reactjs/react.dev', name: 'React Documentation', category: 'Core React', tier: 'Tier 1' },

    // Routing
    { repo: 'remix-run/react-router', name: 'React Router', category: 'Routing', tier: 'Tier 1' },
    { repo: 'TanStack/router', name: 'TanStack Router', category: 'Routing', tier: 'Tier 2' },
    { repo: 'molefrog/wouter', name: 'Wouter', category: 'Routing', tier: 'Tier 2' },

    // Frameworks
    { repo: 'vercel/next.js', name: 'Next.js', category: 'Frameworks', tier: 'Tier 1' },
    { repo: 'remix-run/remix', name: 'Remix', category: 'Frameworks', tier: 'Tier 1' },
    { repo: 'gatsbyjs/gatsby', name: 'Gatsby', category: 'Frameworks', tier: 'Tier 2' },

    // State Management
    { repo: 'reduxjs/redux', name: 'Redux', category: 'State Management', tier: 'Tier 1' },
    { repo: 'reduxjs/redux-toolkit', name: 'Redux Toolkit', category: 'State Management', tier: 'Tier 1' },
    { repo: 'pmndrs/zustand', name: 'Zustand', category: 'State Management', tier: 'Tier 1' },
    { repo: 'pmndrs/jotai', name: 'Jotai', category: 'State Management', tier: 'Tier 2' },
    { repo: 'facebookexperimental/Recoil', name: 'Recoil', category: 'State Management', tier: 'Tier 2' },
    { repo: 'pmndrs/valtio', name: 'Valtio', category: 'State Management', tier: 'Tier 2' },
    { repo: 'mobxjs/mobx', name: 'MobX', category: 'State Management', tier: 'Tier 2' },

    // Data Fetching
    { repo: 'TanStack/query', name: 'TanStack Query', category: 'Data Fetching', tier: 'Tier 1' },
    { repo: 'vercel/swr', name: 'SWR', category: 'Data Fetching', tier: 'Tier 1' },
    { repo: 'apollographql/apollo-client', name: 'Apollo Client', category: 'Data Fetching', tier: 'Tier 1' },
    { repo: 'facebook/relay', name: 'Relay', category: 'Data Fetching', tier: 'Tier 2' },

    // UI Libraries
    { repo: 'mui/material-ui', name: 'Material-UI', category: 'UI Libraries', tier: 'Tier 1' },
    { repo: 'chakra-ui/chakra-ui', name: 'Chakra UI', category: 'UI Libraries', tier: 'Tier 1' },
    { repo: 'ant-design/ant-design', name: 'Ant Design', category: 'UI Libraries', tier: 'Tier 1' },
    { repo: 'mantinedev/mantine', name: 'Mantine', category: 'UI Libraries', tier: 'Tier 2' },
    { repo: 'radix-ui/primitives', name: 'Radix UI', category: 'UI Libraries', tier: 'Tier 2' },

    // Forms
    { repo: 'react-hook-form/react-hook-form', name: 'React Hook Form', category: 'Forms', tier: 'Tier 1' },
    { repo: 'jaredpalmer/formik', name: 'Formik', category: 'Forms', tier: 'Tier 2' },

    // Animation
    { repo: 'framer/motion', name: 'Framer Motion', category: 'Animation', tier: 'Tier 1' },
    { repo: 'pmndrs/react-spring', name: 'React Spring', category: 'Animation', tier: 'Tier 2' },

    // Testing
    { repo: 'testing-library/react-testing-library', name: 'React Testing Library', category: 'Testing', tier: 'Tier 1' },

    // 3D Graphics
    { repo: 'pmndrs/react-three-fiber', name: 'React Three Fiber', category: '3D Graphics', tier: 'Tier 2' },
    { repo: 'pmndrs/drei', name: 'Drei', category: '3D Graphics', tier: 'Tier 2' },

    // Add more as needed - this is a subset for initial implementation
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
