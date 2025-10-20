# Immersive React Ecosystem Constellation

Design an animated, award-worthy visualization that celebrates the React ecosystem as a luminous constellation. The scene should feel alive: nodes glow, lines pulse, the entire graph orbits slowly, and subtle nebula gradients breathe in the background.

---

## Experience Goals
- Build instant understanding of React’s surrounding tools by grouping libraries into clusters (state, styling, testing, data, tooling).
- Convey motion without overwhelming the eyes: graceful rotation, gentle camera drift, ambient particles.
- Reward exploration with hover/click annotations that surface each library’s role.

---

## Technology Stack
- **React + TypeScript** for component structure.
- **@react-three/fiber** to drive a WebGL scene with React primitives.
- **@react-three/drei** helpers (GLTF loader, gradients, controls, text).
- **@react-three/postprocessing** for bloom/glow passes.
- **Framer Motion** (optional) for UI overlays and micro-interactions.
- **MSW / Fixtures** for mocking library metadata if you surface extra details.

Skia/WASM can layer additional shader polish, but WebGL via `react-three-fiber` keeps the implementation approachable for most engineers.

---

## Setup

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing framer-motion
```

Place the visualization inside `src/features/ecosystem`, keeping supporting data in `src/features/ecosystem/data`.

```
src/
  features/
    ecosystem/
      NetworkConstellation.tsx
      useConstellationLayout.ts
      data/
        reactLibraries.ts
      styles/
        constellation.css
```

---

## Data Model

```ts
// src/features/ecosystem/data/reactLibraries.ts
export type LibraryNode = {
  id: string;
  label: string;
  category: 'core' | 'state' | 'styling' | 'testing' | 'data' | 'tooling';
  connections: string[];
};

export const reactConstellation: LibraryNode[] = [
  { id: 'react', label: 'React', category: 'core', connections: ['react-dom', 'redux', 'react-router'] },
  { id: 'react-dom', label: 'React DOM', category: 'core', connections: ['react'] },
  { id: 'redux', label: 'Redux', category: 'state', connections: ['react', '@reduxjs/toolkit', 'redux-saga'] },
  { id: '@reduxjs/toolkit', label: 'RTK', category: 'state', connections: ['redux', 'react'] },
  { id: 'zustand', label: 'Zustand', category: 'state', connections: ['react'] },
  { id: 'react-router', label: 'React Router', category: 'data', connections: ['react'] },
  { id: 'react-query', label: 'TanStack Query', category: 'data', connections: ['react', 'axios'] },
  { id: 'axios', label: 'Axios', category: 'data', connections: ['react-query'] },
  { id: 'styled-components', label: 'Styled Components', category: 'styling', connections: ['react'] },
  { id: 'tailwind', label: 'Tailwind CSS', category: 'styling', connections: ['react', 'framer-motion'] },
  { id: 'framer-motion', label: 'Framer Motion', category: 'styling', connections: ['react'] },
  { id: 'jest', label: 'Jest', category: 'testing', connections: ['react', 'testing-library'] },
  { id: 'testing-library', label: 'Testing Library', category: 'testing', connections: ['jest', 'react'] },
  { id: 'cypress', label: 'Cypress', category: 'testing', connections: ['react'] },
  { id: 'webpack', label: 'Webpack', category: 'tooling', connections: ['babel', 'react'] },
  { id: 'vite', label: 'Vite', category: 'tooling', connections: ['react', 'tailwind'] },
  { id: 'babel', label: 'Babel', category: 'tooling', connections: ['react', 'webpack'] }
];
```

---

## Layout Generator

```ts
// src/features/ecosystem/useConstellationLayout.ts
import { useMemo } from 'react';
import type { LibraryNode } from './data/reactLibraries';

type PositionedNode = LibraryNode & { position: [number, number, number]; color: string };

const palette: Record<LibraryNode['category'], string> = {
  core: '#7dd3fc',
  state: '#fbbf24',
  styling: '#f472b6',
  testing: '#c4b5fd',
  data: '#34d399',
  tooling: '#f97316'
};

const categoryOffsets: Record<LibraryNode['category'], number> = {
  core: 0,
  state: Math.PI / 12,
  styling: Math.PI / 6,
  testing: Math.PI / 4,
  data: Math.PI / 3,
  tooling: Math.PI / 2.5
};

export const useConstellationLayout = (nodes: LibraryNode[]) => {
  return useMemo<PositionedNode[]>(() => {
    const radius = 8;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    return nodes.map((node, index) => {
      const offset = categoryOffsets[node.category];
      const theta = (2 * Math.PI * index) / goldenRatio + offset;
      const phi = Math.acos(1 - (2 * (index + 0.5)) / nodes.length);

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      return { ...node, position: [x, y, z], color: palette[node.category] };
    });
  }, [nodes]);
};
```

---

## Scene Composition

```tsx
// src/features/ecosystem/NetworkConstellation.tsx
'use client';

import React, { Suspense, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line, OrbitControls, Text, GradientTexture, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { LibraryNode } from './data/reactLibraries';
import { reactConstellation } from './data/reactLibraries';
import { useConstellationLayout } from './useConstellationLayout';
import './styles/constellation.css';

type PositionedNode = ReturnType<typeof useConstellationLayout>[number];

const GlowingNode = ({
  node,
  onFocus,
  onBlur
}: {
  node: PositionedNode;
  onFocus: (node: LibraryNode) => void;
  onBlur: () => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const pulse = 1 + Math.sin(clock.getElapsedTime() * 1.2) * 0.1;
    if (meshRef.current) {
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <Float floatIntensity={1.4} rotationIntensity={0.5} speed={1.2}>
      <group
        position={node.position}
        onPointerOver={() => onFocus(node)}
        onPointerOut={onBlur}
        onPointerDown={() => onFocus(node)}
      >
        <mesh ref={meshRef}>
          <sphereGeometry args={[0.28, 48, 48]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={1.35}
            roughness={0.32}
            metalness={0.25}
          />
        </mesh>
        <Text position={[0, 1.1, 0]} fontSize={0.7} color="#e2e8f0" anchorX="center" anchorY="middle">
          {node.label}
        </Text>
      </group>
    </Float>
  );
};

const Connections = ({ nodes }: { nodes: PositionedNode[] }) => {
  const lookup = useMemo(() => new Map(nodes.map((node) => [node.id, node.position])), [nodes]);

  return (
    <>
      {nodes.flatMap((node) =>
        node.connections
          .filter((targetId) => lookup.has(targetId) && node.id < targetId)
          .map((targetId) => {
            const key = `${node.id}-${targetId}`;
            const to = lookup.get(targetId) as [number, number, number];

            return (
              <Line
                key={key}
                points={[node.position, to]}
                color={node.color}
                transparent
                opacity={0.45}
                lineWidth={1.8}
                dashed={false}
              />
            );
          })
      )}
    </>
  );
};

const RotatingGroup = ({ children }: { children: React.ReactNode }) => {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.04;
      group.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.02) * 0.1;
    }
  });

  return <group ref={group}>{children}</group>;
};

const BackgroundGlow = () => (
  <mesh>
    <sphereGeometry args={[30, 64, 64]} />
    <meshBasicMaterial side={THREE.BackSide}>
      <GradientTexture
        stops={[0, 0.3, 0.6, 1]}
        colors={['#020617', '#0f172a', '#1d1b4c', '#4c1d95']}
        size={1024}
      />
    </meshBasicMaterial>
  </mesh>
);

const LibraryDetails = ({ node }: { node: LibraryNode }) => (
  <div className="constellation-tooltip">
    <h3>{node.label}</h3>
    <p>Category: {node.category}</p>
    <p>Connections: {node.connections.length}</p>
  </div>
);

export const NetworkConstellation = () => {
  const nodes = useConstellationLayout(reactConstellation);
  const [focusedNode, setFocusedNode] = useState<LibraryNode | null>(null);

  return (
    <div className="constellation-wrapper">
      <Canvas camera={{ position: [0, 0, 20], fov: 45 }}>
        <color attach="background" args={['#01010f']} />
        <Suspense fallback={null}>
          <BackgroundGlow />
          <Stars radius={80} depth={60} count={2000} factor={4} saturation={0} fade speed={0.6} />
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <pointLight position={[0, 10, 10]} intensity={1.2} color="#60a5fa" />
          <pointLight position={[-10, -10, -5]} intensity={0.6} color="#f472b6" />

          <RotatingGroup>
            <Connections nodes={nodes} />
            {nodes.map((node) => (
              <GlowingNode key={node.id} node={node} onFocus={setFocusedNode} onBlur={() => setFocusedNode(null)} />
            ))}
          </RotatingGroup>
        </Suspense>

        <OrbitControls enableZoom={false} />
        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.1} luminanceSmoothing={0.8} />
        </EffectComposer>
      </Canvas>

      <div className="constellation-overlay">
        <h1>React Ecosystem Constellation</h1>
        <p>Explore the libraries orbiting React. Hover the stars to reveal their relationships.</p>
      </div>

      {focusedNode ? <LibraryDetails node={focusedNode} /> : null}
    </div>
  );
};
```

---

## Styling

```css
/* src/features/ecosystem/styles/constellation.css */
.constellation-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 120px);
  background: radial-gradient(circle at 20% 20%, rgba(25, 0, 75, 0.6), rgba(2, 4, 32, 0.95));
  overflow: hidden;
  border-radius: 24px;
  box-shadow: 0 40px 120px rgba(15, 23, 42, 0.65);
}

.constellation-overlay {
  position: absolute;
  top: 32px;
  left: 32px;
  color: #e2e8f0;
  max-width: 340px;
  backdrop-filter: blur(12px);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.65), rgba(17, 24, 39, 0.35));
  padding: 20px 24px;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.45);
}

.constellation-overlay h1 {
  font-size: 1.8rem;
  margin-bottom: 8px;
}

.constellation-overlay p {
  line-height: 1.6;
  color: #cbd5f5;
}

.constellation-tooltip {
  position: absolute;
  bottom: 32px;
  right: 32px;
  min-width: 200px;
  pointer-events: none;
  background: rgba(15, 23, 42, 0.85);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(96, 165, 250, 0.35);
  box-shadow: 0 20px 60px rgba(8, 47, 73, 0.55);
  color: #f8fafc;
  text-align: center;
}

.constellation-tooltip h3 {
  margin-bottom: 6px;
  font-size: 1.1rem;
}
```

---

## Bringing It Into Docs

1. Create a MDX page inside `docs/` or within your documentation site (e.g., Docusaurus, Next.js App Router).
2. Import the component and guard it for client-side rendering if the docs are statically generated.

```tsx
// docs/pages/react-ecosystem.mdx (Next.js example)
import dynamic from 'next/dynamic';

const NetworkConstellation = dynamic(
  () => import('../../src/features/ecosystem/NetworkConstellation').then((mod) => mod.NetworkConstellation),
  { ssr: false }
);

export default function ReactEcosystemDoc() {
  return (
    <section>
      <NetworkConstellation />
    </section>
  );
}
```

---

## Polish Checklist
- Layer a soft particle field using `Points` for depth.
- Add music-reactive animation via the Web Audio API for event screens.
- Trigger camera fly-through on scroll with `drei`’s `<ScrollControls>`.
- Offer a accessibility toggle that swaps to high-contrast colors and static layout.
- Capture a screenshot with `gl.captureScene()` to create shareable postcards.

---

## Optional Enhancements
- **Skia Overlay**: Use `@shopify/react-native-skia` with WASM on the web for additional bloom trails behind nodes. Render the Skia layer on top of the WebGL canvas for combined depth + painterly glow.
- **Narrative Mode**: Sequence animations with `framer-motion` to focus on one cluster at a time, adding captions that describe how the libraries collaborate.
- **Search Palette**: Implement a command palette (`cmd+k`) to highlight a library, auto-centering the camera.

---

Blend art direction with technical clarity. With the layout, lighting, and interaction model above, your documentation can guide anyone—from designer to engineer—through building a mesmerizing network map of the React world. Aim for a balance of cinematic glow and legible information hierarchy, and iterate on the palette until it feels like a night sky worthy of an award stage.
