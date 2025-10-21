/**
 * Starfield - Three.js
 * Edge-to-edge starfield with color temperature 3000K-6000K
 */

'use client';

import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Enterprise } from './enterprise-flyby';

/**
 * Create a circular texture for round stars
 */
function createStarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d')!;

  // Draw a soft circle
  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 16);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Create a starburst texture (4-pointed star)
 */
function createStarburstTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'white';

  // Horizontal beam
  const hGradient = ctx.createLinearGradient(0, 16, 32, 16);
  hGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  hGradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
  hGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = hGradient;
  ctx.fillRect(0, 14, 32, 4);

  // Vertical beam
  const vGradient = ctx.createLinearGradient(16, 0, 16, 32);
  vGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
  vGradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
  vGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = vGradient;
  ctx.fillRect(14, 0, 4, 32);

  // Center bright spot
  const centerGradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 8);
  centerGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  centerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = centerGradient;
  ctx.fillRect(8, 8, 16, 16);

  return new THREE.CanvasTexture(canvas);
}

/**
 * Convert color temperature (Kelvin) to RGB
 */
function kelvinToRGB(kelvin: number): [number, number, number] {
  const temp = kelvin / 100;
  let r, g, b;

  if (temp < 30) {
    // Deep red/orange (hot embers)
    r = 1.0;
    g = 0.3 + (temp - 25) / 5 * 0.3;
    b = 0.1 + (temp - 25) / 5 * 0.2;
  } else if (temp < 40) {
    // Orange/yellow
    r = 1.0;
    g = 0.6 + (temp - 30) / 10 * 0.3;
    b = 0.3 + (temp - 30) / 10 * 0.3;
  } else if (temp < 50) {
    // Warm white
    r = 1.0;
    g = 0.9 + (temp - 40) / 10 * 0.1;
    b = 0.6 + (temp - 40) / 10 * 0.3;
  } else if (temp < 60) {
    // White
    r = 1.0;
    g = 1.0;
    b = 0.9 + (temp - 50) / 10 * 0.1;
  } else {
    // Cool (blue/cyan)
    r = 0.7 + (70 - temp) / 10 * 0.3;
    g = 0.85 + (70 - temp) / 10 * 0.15;
    b = 1.0;
  }

  return [r, g, b];
}

function Stars() {
  const regularStarsRef = useRef<THREE.Points>(null);
  const starburstStarsRef = useRef<THREE.Points>(null);
  const starCount = 500;
  const starburstCount = 50; // 10% of stars have starburst

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);
    const size = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Position stars edge-to-edge (HUGE spread for full viewport)
      pos[i * 3] = (Math.random() - 0.5) * 300;     // x: -150 to 150
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200;  // y: -100 to 100
      pos[i * 3 + 2] = -5 - Math.random() * 5;      // z: -5 to -10

      // Color temperature 2500K to 6500K (includes reds and oranges)
      const temp = 2500 + Math.random() * 4000;
      const [r, g, b] = kelvinToRGB(temp);
      const brightness = 0.4 + Math.random() * 1.0; // 0.4 to 1.4 (huge variation!)

      col[i * 3] = r * brightness;
      col[i * 3 + 1] = g * brightness;
      col[i * 3 + 2] = b * brightness;

      // Size variation (100-120%)
      const baseSize = 0.001;
      size[i] = baseSize * (1.0 + Math.random() * 0.2); // 1.0x to 1.2x (100-120%)
    }

    return { positions: pos, colors: col, sizes: size };
  }, []);

  // Starburst stars (brighter, bigger stars with cross pattern)
  const starburstData = useMemo(() => {
    const pos = new Float32Array(starburstCount * 3);
    const col = new Float32Array(starburstCount * 3);
    const size = new Float32Array(starburstCount);

    for (let i = 0; i < starburstCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 300;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
      pos[i * 3 + 2] = -5 - Math.random() * 5;

      const temp = 2500 + Math.random() * 4000; // Full range for variety
      const [r, g, b] = kelvinToRGB(temp);
      const brightness = 1.3 + Math.random() * 0.5; // Very bright (1.3 to 1.8)

      col[i * 3] = r * brightness;
      col[i * 3 + 1] = g * brightness;
      col[i * 3 + 2] = b * brightness;

      // Bigger for starburst effect
      size[i] = 0.002 * (1.2 + Math.random() * 0.3);
    }

    return { positions: pos, colors: col, sizes: size };
  }, []);

  // Parallax scrolling based on star size (bigger = closer = faster)
  useFrame((state, delta) => {
    // Scroll regular stars - speed based on size
    if (regularStarsRef.current) {
      const positions = regularStarsRef.current.geometry.attributes.position.array as Float32Array;
      const starSizes = regularStarsRef.current.geometry.attributes.size.array as Float32Array;

      for (let i = 0; i < starCount; i++) {
        // Parallax: bigger stars (closer) move faster
        const sizeFactor = starSizes[i] / 0.001; // Normalize around base size
        const speed = 2 + sizeFactor * 3; // 2 to 5 units/sec based on size

        positions[i * 3] -= delta * speed;

        // Wrap when offscreen on left
        if (positions[i * 3] < -150) {
          positions[i * 3] = 150;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        }
      }

      regularStarsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Scroll starburst stars - faster (they're bigger/closer)
    if (starburstStarsRef.current) {
      const positions = starburstStarsRef.current.geometry.attributes.position.array as Float32Array;
      const starSizes = starburstStarsRef.current.geometry.attributes.size.array as Float32Array;

      for (let i = 0; i < starburstCount; i++) {
        // Starburst stars are closer, move faster
        const sizeFactor = starSizes[i] / 0.002;
        const speed = 5 + sizeFactor * 4; // 5 to 9 units/sec

        positions[i * 3] -= delta * speed;

        // Wrap when offscreen
        if (positions[i * 3] < -150) {
          positions[i * 3] = 150;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        }
      }

      starburstStarsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Regular stars */}
      <points ref={regularStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={starCount}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={starCount}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={2}
          vertexColors
          transparent
          opacity={1.0}
          sizeAttenuation={false}
          blending={THREE.AdditiveBlending}
          map={createStarTexture()}
          depthWrite={false}
        />
      </points>

      {/* Starburst stars */}
      <points ref={starburstStarsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starburstCount}
            array={starburstData.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={starburstCount}
            array={starburstData.colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={starburstCount}
            array={starburstData.sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={4}
          vertexColors
          transparent
          opacity={1.0}
          sizeAttenuation={false}
          blending={THREE.AdditiveBlending}
          map={createStarburstTexture()}
          depthWrite={false}
        />
      </points>
    </>
  );
}

function ShootingStar({ startPos, endPos, color, onComplete }: {
  startPos: [number, number, number];
  endPos: [number, number, number];
  color: [number, number, number];
  onComplete: () => void;
}) {
  const lineRef = useRef<THREE.Line>(null);
  const contrailRef = useRef<THREE.Line>(null);
  const [progress, setProgress] = useState(0);
  const [contrailFade, setContrailFade] = useState(1);

  useFrame((state, delta) => {
    const newProgress = progress + delta * 3; // 2x faster

    if (newProgress <= 1.3) { // Continue well past viewport
      // Star is still moving
      setProgress(newProgress);

      // Update main bright streak (shorter, tighter)
      if (lineRef.current) {
        const currentPos = new THREE.Vector3(
          startPos[0] + (endPos[0] - startPos[0]) * newProgress,
          startPos[1] + (endPos[1] - startPos[1]) * newProgress,
          startPos[2]
        );

        const trailStart = new THREE.Vector3(
          currentPos.x - (endPos[0] - startPos[0]) * 0.12, // Shorter streak (50% of before)
          currentPos.y - (endPos[1] - startPos[1]) * 0.12,
          startPos[2]
        );

        const positions = lineRef.current.geometry.attributes.position.array as Float32Array;
        positions[0] = trailStart.x;
        positions[1] = trailStart.y;
        positions[2] = trailStart.z;
        positions[3] = currentPos.x;
        positions[4] = currentPos.y;
        positions[5] = currentPos.z;

        lineRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Update contrail (full path behind)
      if (contrailRef.current) {
        const currentPos = new THREE.Vector3(
          startPos[0] + (endPos[0] - startPos[0]) * newProgress,
          startPos[1] + (endPos[1] - startPos[1]) * newProgress,
          startPos[2]
        );

        const positions = contrailRef.current.geometry.attributes.position.array as Float32Array;
        positions[0] = startPos[0];
        positions[1] = startPos[1];
        positions[2] = startPos[2];
        positions[3] = currentPos.x;
        positions[4] = currentPos.y;
        positions[5] = currentPos.z;

        contrailRef.current.geometry.attributes.position.needsUpdate = true;
      }
    } else {
      // Star is done, fade the contrail slowly
      setContrailFade(f => {
        const newFade = f - delta * 0.2; // Fade over 5 seconds
        if (newFade <= 0) {
          onComplete();
          return 0;
        }
        return newFade;
      });
    }
  });

  return (
    <>
      {/* Main bright streak (leading edge) */}
      {progress <= 1.3 && (
        <line ref={lineRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array(6)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={new THREE.Color(color[0] * 3, color[1] * 3, color[2] * 3)}
            transparent
            opacity={1.0}
            blending={THREE.AdditiveBlending}
            linewidth={3}
          />
        </line>
      )}

      {/* Contrail (fading glow trail) */}
      <line ref={contrailRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array(6)}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={new THREE.Color(color[0], color[1], color[2])}
          transparent
          opacity={contrailFade * 0.4}
          blending={THREE.AdditiveBlending}
          linewidth={4}
        />
      </line>
    </>
  );
}

function ShootingStars() {
  const [shootingStars, setShootingStars] = useState<Array<{
    id: number;
    startPos: [number, number, number];
    endPos: [number, number, number];
    color: [number, number, number];
  }>>([]);

  const nextId = useRef(0);

  useFrame(() => {
    // Random chance to spawn shooting star (every ~5-10 seconds)
    if (Math.random() < 0.005) {
      const temp = 4000 + Math.random() * 2000; // Brighter stars
      const [r, g, b] = kelvinToRGB(temp);

      // Start off-screen on left/top, end off-screen on right/bottom
      const startX = -180;
      const startY = 50 + Math.random() * 50; // Top area
      const endX = 180; // Fully across viewport
      const endY = startY - 120 - Math.random() * 60; // Diagonal down

      setShootingStars(prev => [...prev, {
        id: nextId.current++,
        startPos: [startX, startY, -5],
        endPos: [endX, endY, -5],
        color: [r, g, b],
      }]);
    }
  });

  const handleComplete = (id: number) => {
    setShootingStars(prev => prev.filter(s => s.id !== id));
  };

  return (
    <>
      {shootingStars.map(star => (
        <ShootingStar
          key={star.id}
          startPos={star.startPos}
          endPos={star.endPos}
          color={star.color}
          onComplete={() => handleComplete(star.id)}
        />
      ))}
    </>
  );
}

export function Starfield() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, 100], fov: 75 }}
        gl={{ alpha: true, antialias: false }}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />

        <Stars />
        <ShootingStars />
        <Enterprise />

        {/* Bloom for glowing stars */}
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.3}
            luminanceSmoothing={0.9}
            radius={0.6}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
