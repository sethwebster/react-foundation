/**
 * Starfield - Three.js
 * Edge-to-edge starfield with color temperature 3000K-6000K
 */

'use client';

import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Line } from '@react-three/drei';
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
            args={[positions, 3]}
            attach="attributes-position"
            count={starCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            args={[colors, 3]}
            attach="attributes-color"
            count={starCount}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            args={[sizes, 1]}
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
            args={[starburstData.positions, 3]}
            attach="attributes-position"
            count={starburstCount}
            array={starburstData.positions}
            itemSize={3}
          />
          <bufferAttribute
            args={[starburstData.colors, 3]}
            attach="attributes-color"
            count={starburstCount}
            array={starburstData.colors}
            itemSize={3}
          />
          <bufferAttribute
            args={[starburstData.sizes, 1]}
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
  const smokeRef = useRef<THREE.Points>(null);
  const [progress, setProgress] = useState(0);
  const [streakPoints, setStreakPoints] = useState<[number, number, number][]>([startPos, startPos]);
  const [contrailPoints, setContrailPoints] = useState<[number, number, number][]>([startPos, startPos]);
  const [contrailFade, setContrailFade] = useState(1);
  const smokeParticles = useRef<Array<{
    pos: THREE.Vector3;
    age: number;
    velocity: THREE.Vector3;
  }>>([]);

  useFrame((state, delta) => {
    const newProgress = progress + delta * 3; // 2x faster

    if (newProgress <= 1.3) { // Continue well past viewport
      // Star is still moving
      setProgress(newProgress);

      // Update streak and contrail positions
      const currentPos: [number, number, number] = [
        startPos[0] + (endPos[0] - startPos[0]) * newProgress,
        startPos[1] + (endPos[1] - startPos[1]) * newProgress,
        startPos[2]
      ];

      const trailStart: [number, number, number] = [
        currentPos[0] - (endPos[0] - startPos[0]) * 0.12,
        currentPos[1] - (endPos[1] - startPos[1]) * 0.12,
        startPos[2]
      ];

      setStreakPoints([trailStart, currentPos]);

      // Add contrail (full path showing)
      const contrailStart: [number, number, number] = [
        startPos[0],
        startPos[1],
        startPos[2]
      ];
      setContrailPoints([contrailStart, currentPos]);

      // Spawn smoke particles along the trail (every frame!)
      smokeParticles.current.push({
        pos: new THREE.Vector3(currentPos[0], currentPos[1], currentPos[2]),
        age: 0,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 5, // Faster outward expansion
          (Math.random() - 0.5) * 5,
          0
        ),
      });
    }

    // Update smoke particles (expand and fade like smoke)
    smokeParticles.current = smokeParticles.current
      .map(p => {
        // Move particle outward (smoke expansion)
        p.pos.add(p.velocity.clone().multiplyScalar(delta));
        p.age += delta;
        return p;
      })
      .filter(p => p.age < 1.5); // Fade over 1.5 seconds

    // Start fading contrail early (while star is still moving)
    if (newProgress > 0.6) {
      setContrailFade(f => Math.max(0, f - delta * 33.3)); // 30ms fade
    }

    // Clean up when done
    if (newProgress > 3.0 && smokeParticles.current.length === 0) {
      onComplete();
    }

    // Update smoke particle geometry
    if (smokeRef.current && smokeParticles.current.length > 0) {
      const maxParticles = 100;
      const positions = new Float32Array(maxParticles * 3);
      const colors = new Float32Array(maxParticles * 3);
      const sizes = new Float32Array(maxParticles);

      // Debug
      if (smokeParticles.current.length > 10 && Math.random() < 0.01) {
        console.log(`Smoke particles: ${smokeParticles.current.length}`);
      }

      for (let i = 0; i < Math.min(smokeParticles.current.length, maxParticles); i++) {
        const particle = smokeParticles.current[i];

        positions[i * 3] = particle.pos.x;
        positions[i * 3 + 1] = particle.pos.y;
        positions[i * 3 + 2] = particle.pos.z;

        // Fade out exponentially
        const fade = Math.pow(1 - particle.age / 1.5, 2);
        colors[i * 3] = color[0] * fade * 3; // Very bright
        colors[i * 3 + 1] = color[1] * fade * 3;
        colors[i * 3 + 2] = color[2] * fade * 3;

        // Expand as it ages (like smoke)
        sizes[i] = 8 + particle.age * 25; // Grows bigger and faster (8 to 45.5)
      }

      const posAttr = new THREE.BufferAttribute(positions, 3);
      const colAttr = new THREE.BufferAttribute(colors, 3);
      const sizeAttr = new THREE.BufferAttribute(sizes, 1);

      posAttr.setUsage(THREE.DynamicDrawUsage);
      colAttr.setUsage(THREE.DynamicDrawUsage);
      sizeAttr.setUsage(THREE.DynamicDrawUsage);

      smokeRef.current.geometry.setAttribute('position', posAttr);
      smokeRef.current.geometry.setAttribute('color', colAttr);
      smokeRef.current.geometry.setAttribute('size', sizeAttr);

      // Force geometry update
      smokeRef.current.geometry.attributes.position.needsUpdate = true;
      smokeRef.current.geometry.attributes.color.needsUpdate = true;
      smokeRef.current.geometry.attributes.size.needsUpdate = true;

      // Set draw range to only render actual particles
      smokeRef.current.geometry.setDrawRange(0, smokeParticles.current.length);
    }
  });

  return (
    <>
      {/* Main bright streak (leading edge) */}
      {progress <= 1.3 && (
        <Line
          points={streakPoints}
          color={new THREE.Color(color[0] * 3, color[1] * 3, color[2] * 3)}
          lineWidth={3}
          transparent
          opacity={1.0}
        />
      )}

      {/* Contrail afterimage (quick flash) */}
      {contrailFade > 0 && (
        <Line
          points={contrailPoints}
          color={new THREE.Color(color[0] * 1.5, color[1] * 1.5, color[2] * 1.5)}
          lineWidth={4}
          transparent
          opacity={contrailFade * 0.4}
        />
      )}

      {/* Smoke particles (expanding and fading like smoke) */}
      <points ref={smokeRef}>
        <bufferGeometry />
        <pointsMaterial
          size={1}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation={false}
          blending={THREE.AdditiveBlending}
          map={createStarTexture()}
          depthWrite={false}
        />
      </points>
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
