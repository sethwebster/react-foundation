import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LibraryIcon, libraryDisplayNames } from './library-icons';
import { ecosystemLibraries } from './maintainer-tiers';
import { LibrariesLoader } from './ingest/loaders/libraries';
import { NPMCollector } from './ris/collectors/npm-collector';
import { PROBE_REPOS } from './ris/data/probe-repos';

function findLibrary(owner: string, name: string) {
  return ecosystemLibraries.find((library) => library.owner === owner && library.name === name);
}

describe('ecosystemLibraries', () => {
  it('tracks community-approved ecosystem library requests', () => {
    expect(findLibrary('ant-design', 'ant-design')).toMatchObject({
      category: 'ui',
      tier: 1,
    });
    expect(findLibrary('invertase', 'react-native-firebase')).toMatchObject({
      category: 'data',
      tier: 2,
    });
    expect(findLibrary('facebook', 'docusaurus')).toMatchObject({
      category: 'framework',
      tier: 2,
    });
  });

  it('does not contain duplicate repository targets', () => {
    const repositoryKeys = ecosystemLibraries.map((library) => `${library.owner}/${library.name}`);

    expect(new Set(repositoryKeys).size).toBe(repositoryKeys.length);
  });

  it('exposes every tracked library to the chatbot knowledge base', async () => {
    const loader = new LibrariesLoader();
    const records = await loader.load();
    const loadedIds = new Set(records.map((record) => record.id));

    const missing = ecosystemLibraries
      .filter((library) => !loadedIds.has(`library-${library.owner}-${library.name}`.toLowerCase()))
      .map((library) => `${library.owner}/${library.name}`);

    expect(missing).toEqual([]);
  });

  it('maps requested repositories to their primary npm packages', () => {
    expect(NPMCollector.getPackageName('ant-design', 'ant-design')).toBe('antd');
    expect(NPMCollector.getPackageName('invertase', 'react-native-firebase')).toBe(
      '@react-native-firebase/app'
    );
    expect(NPMCollector.getPackageName('facebook', 'docusaurus')).toBe('@docusaurus/core');
  });

  it('includes Docusaurus in related library datasets', async () => {
    expect(libraryDisplayNames.docusaurus).toBe('Docusaurus');

    expect(PROBE_REPOS).toContainEqual(
      expect.objectContaining({
        owner: 'facebook',
        repo: 'docusaurus',
        category: 'framework',
      })
    );

    const loader = new LibrariesLoader();
    const records = await loader.load();
    expect(records).toContainEqual(
      expect.objectContaining({
        id: 'library-facebook-docusaurus',
        title: 'Docusaurus',
      })
    );
  });

  it('includes StyleX in related library datasets', async () => {
    expect(findLibrary('facebook', 'stylex')).toMatchObject({
      category: 'styling',
      tier: 2,
    });
    expect(NPMCollector.getPackageName('facebook', 'stylex')).toBe('@stylexjs/stylex');
    expect(libraryDisplayNames.stylex).toBe('StyleX');

    const stylexIconMarkup = renderToStaticMarkup(
      createElement(LibraryIcon, { libraryName: 'stylex', size: 24 })
    );
    expect(stylexIconMarkup).toContain('/assets/library-icons/stylex.svg');

    expect(PROBE_REPOS).toContainEqual(
      expect.objectContaining({
        owner: 'facebook',
        repo: 'stylex',
        category: 'ui-library',
      })
    );

    const loader = new LibrariesLoader();
    const records = await loader.load();
    expect(records).toContainEqual(
      expect.objectContaining({
        id: 'library-facebook-stylex',
        title: 'StyleX',
      })
    );
  });

  it('includes Base UI in related library datasets', async () => {
    expect(findLibrary('mui', 'base-ui')).toMatchObject({
      category: 'ui',
      tier: 2,
    });
    expect(NPMCollector.getPackageName('mui', 'base-ui')).toBe('@base-ui/react');
    expect(libraryDisplayNames['base-ui']).toBe('Base UI');

    const loader = new LibrariesLoader();
    const records = await loader.load();
    expect(records).toContainEqual(
      expect.objectContaining({
        id: 'library-mui-base-ui',
        title: 'Base UI',
      })
    );
  });

  it('includes React Strict DOM in related library datasets', async () => {
    expect(findLibrary('facebook', 'react-strict-dom')).toMatchObject({
      category: 'core',
      tier: 2,
    });
    expect(NPMCollector.getPackageName('facebook', 'react-strict-dom')).toBe('react-strict-dom');
    expect(libraryDisplayNames['react-strict-dom']).toBe('React Strict DOM');

    expect(PROBE_REPOS).toContainEqual(
      expect.objectContaining({
        owner: 'facebook',
        repo: 'react-strict-dom',
        category: 'ui-library',
      })
    );

    const loader = new LibrariesLoader();
    const records = await loader.load();
    expect(records).toContainEqual(
      expect.objectContaining({
        id: 'library-facebook-react-strict-dom',
        title: 'React Strict DOM',
      })
    );
  });

  it('includes React Three Fiber in related library datasets', async () => {
    expect(findLibrary('pmndrs', 'react-three-fiber')).toMatchObject({
      category: 'animation',
      tier: 2,
    });
    expect(NPMCollector.getPackageName('pmndrs', 'react-three-fiber')).toBe('@react-three/fiber');
    expect(libraryDisplayNames['react-three-fiber']).toBe('React Three Fiber');

    const loader = new LibrariesLoader();
    const records = await loader.load();
    expect(records).toContainEqual(
      expect.objectContaining({
        id: 'library-pmndrs-react-three-fiber',
        title: 'React Three Fiber',
      })
    );
  });

  it('includes React Native Testing Library in related library datasets', async () => {
    expect(findLibrary('callstack', 'react-native-testing-library')).toMatchObject({
      category: 'testing',
      tier: 2,
    });
    expect(NPMCollector.getPackageName('callstack', 'react-native-testing-library')).toBe(
      '@testing-library/react-native'
    );
    expect(libraryDisplayNames['react-native-testing-library']).toBe('React Native Testing Library');

    const loader = new LibrariesLoader();
    const records = await loader.load();
    expect(records).toContainEqual(
      expect.objectContaining({
        id: 'library-callstack-react-native-testing-library',
        title: 'React Native Testing Library',
      })
    );
  });
});
