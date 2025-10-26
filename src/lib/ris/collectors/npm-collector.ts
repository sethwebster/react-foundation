/**
 * NPM Registry Collector
 * Fetches download stats and package metadata from NPM
 */

export interface NPMMetrics {
  downloads_12mo: number;
  downloads_last_month: number;
  package_name: string;
  latest_version: string;
  license: string;
  dependents_count: number; // Approximate, from npms.io
  typescript_support: boolean;
}

export class NPMCollector {
  private readonly NPM_DOWNLOADS_API = 'https://api.npmjs.org/downloads';
  private readonly NPM_REGISTRY_API = 'https://registry.npmjs.org';
  private readonly NPMS_IO_API = 'https://api.npms.io/v2';

  /**
   * Collect NPM metrics for a package
   */
  async collectMetrics(packageName: string): Promise<NPMMetrics> {
    const [downloads, packageInfo, npmsInfo] = await Promise.all([
      this.fetchDownloads(packageName),
      this.fetchPackageInfo(packageName),
      this.fetchNpmsInfo(packageName),
    ]);

    return {
      downloads_12mo: downloads.total_12mo,
      downloads_last_month: downloads.last_month,
      package_name: packageInfo.name,
      latest_version: packageInfo.version,
      license: packageInfo.license,
      dependents_count: npmsInfo.dependents_count,
      typescript_support: packageInfo.has_types,
    };
  }

  /**
   * Fetch download statistics
   */
  private async fetchDownloads(packageName: string) {
    try {
      // Get last 12 months of downloads
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);

      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `${this.NPM_DOWNLOADS_API}/point/${start}:${end}/${packageName}`
      );

      if (!response.ok) {
        console.error(`NPM downloads API error for ${packageName}: ${response.statusText}`);
        return { total_12mo: 0, last_month: 0 };
      }

      const data = await response.json();

      // Get last month separately
      const lastMonthStart = new Date();
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      const lastMonthStartStr = lastMonthStart.toISOString().split('T')[0];
      const lastMonthEndStr = endDate.toISOString().split('T')[0];

      const lastMonthResponse = await fetch(
        `${this.NPM_DOWNLOADS_API}/point/${lastMonthStartStr}:${lastMonthEndStr}/${packageName}`
      );

      const lastMonthData = lastMonthResponse.ok
        ? await lastMonthResponse.json()
        : { downloads: 0 };

      return {
        total_12mo: data.downloads || 0,
        last_month: lastMonthData.downloads || 0,
      };
    } catch (error) {
      console.error(`Error fetching NPM downloads for ${packageName}:`, error);
      return { total_12mo: 0, last_month: 0 };
    }
  }

  /**
   * Fetch package metadata from NPM registry
   */
  private async fetchPackageInfo(packageName: string) {
    try {
      const response = await fetch(`${this.NPM_REGISTRY_API}/${packageName}`);

      if (!response.ok) {
        console.error(`NPM registry error for ${packageName}: ${response.statusText}`);
        return {
          name: packageName,
          version: 'unknown',
          license: 'unknown',
          has_types: false,
        };
      }

      const data = await response.json();
      const latest = data['dist-tags']?.latest || Object.keys(data.versions || {}).pop();
      const latestVersion = data.versions?.[latest];

      // Check for TypeScript support
      const hasTypes =
        !!latestVersion?.types ||
        !!latestVersion?.typings ||
        !!data.versions?.[latest]?.dependencies?.['@types/' + packageName];

      return {
        name: data.name || packageName,
        version: latest || 'unknown',
        license: latestVersion?.license || data.license || 'unknown',
        has_types: hasTypes,
      };
    } catch (error) {
      console.error(`Error fetching NPM package info for ${packageName}:`, error);
      return {
        name: packageName,
        version: 'unknown',
        license: 'unknown',
        has_types: false,
      };
    }
  }

  /**
   * Fetch additional metrics from npms.io
   * (Includes quality scores, dependents count, etc.)
   */
  private async fetchNpmsInfo(packageName: string) {
    try {
      const response = await fetch(`${this.NPMS_IO_API}/package/${packageName}`);

      if (!response.ok) {
        console.error(`npms.io API error for ${packageName}: ${response.statusText}`);
        return { dependents_count: 0 };
      }

      const data = await response.json();

      return {
        dependents_count: data.collected?.npm?.dependentsCount || 0,
      };
    } catch (error) {
      console.error(`Error fetching npms.io info for ${packageName}:`, error);
      return { dependents_count: 0 };
    }
  }

  /**
   * Map repository name to NPM package name
   * Some repos have different NPM package names
   * Returns null for repos that don't have NPM packages
   */
  static getPackageName(owner: string, repo: string): string | null {
    // Special cases where repo name !== package name
    const specialCases: Record<string, string | null> = {
      'facebook/react': 'react',
      'facebook/react-native': 'react-native',
      'facebook/jest': 'jest',
      'facebook/relay': 'react-relay',
      'facebook/hermes': null, // JavaScript engine (C++ binary, not on NPM)
      'facebook/metro': 'metro',
      'facebook/react-devtools': 'react-devtools',
      'reactjs/react.dev': null, // Documentation website (not a library)
      'reactjs/rfcs': null, // RFC repository (not a library)
      'reduxjs/redux': 'redux',
      'reduxjs/redux-toolkit': '@reduxjs/toolkit',
      'pmndrs/zustand': 'zustand',
      'pmndrs/jotai': 'jotai',
      'pmndrs/valtio': 'valtio',
      'pmndrs/react-spring': '@react-spring/web',
      'statelyai/xstate': 'xstate',
      'TanStack/query': '@tanstack/react-query',
      'TanStack/router': '@tanstack/react-router',
      'TanStack/table': '@tanstack/react-table',
      'vercel/swr': 'swr',
      'vercel/next.js': 'next',
      'vercel/turbo': 'turbo',
      'apollographql/apollo-client': '@apollo/client',
      'trpc/trpc': '@trpc/server',
      'urql-graphql/urql': 'urql',
      'remix-run/react-router': 'react-router-dom',
      'remix-run/remix': '@remix-run/react',
      'molefrog/wouter': 'wouter',
      'gatsbyjs/gatsby': 'gatsby',
      'withastro/astro': 'astro',
      'expo/expo': 'expo',
      'react-hook-form/react-hook-form': 'react-hook-form',
      'jaredpalmer/formik': 'formik',
      'colinhacks/zod': 'zod',
      'jquense/yup': 'yup',
      'final-form/react-final-form': 'react-final-form',
      'testing-library/react-testing-library': '@testing-library/react',
      'testing-library/react-hooks-testing-library': '@testing-library/react-hooks',
      'vitest-dev/vitest': 'vitest',
      'microsoft/playwright': '@playwright/test',
      'radix-ui/primitives': '@radix-ui/react-primitive',
      'tailwindlabs/headlessui': '@headlessui/react',
      'adobe/react-spectrum': '@adobe/react-spectrum',
      'ariakit/ariakit': '@ariakit/react',
      'mui/material-ui': '@mui/material',
      'chakra-ui/chakra-ui': '@chakra-ui/react',
      'framer/motion': 'framer-motion',
      'formkit/auto-animate': '@formkit/auto-animate',
      'storybookjs/storybook': 'storybook',
      'vitejs/vite': 'vite',
      'styled-components/styled-components': 'styled-components',
      'emotion-js/emotion': '@emotion/react',
      'tailwindlabs/tailwindcss': 'tailwindcss',
      'marklawlor/nativewind': 'nativewind',
      'react-navigation/react-navigation': '@react-navigation/native',
      'react-native-community/react-native-releases': null, // Release notes repository (not a library)
    };

    const key = `${owner}/${repo}`;
    if (key in specialCases) {
      return specialCases[key];
    }
    return repo;
  }
}
