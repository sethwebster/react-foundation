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

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function randomBetween(index: number, channel: number, min: number, max: number, iteration = 0): number {
  const seed = index * 9973 + channel * 6151 + iteration * 37489;
  const value = pseudoRandom(seed);
  return min + value * (max - min);
}

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
  const regularWraps = useRef(new Uint32Array(starCount));
  const starburstWraps = useRef(new Uint32Array(starburstCount));

  const { positions, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    const col = new Float32Array(starCount * 3);
    const size = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Position stars edge-to-edge (HUGE spread for full viewport)
      pos[i * 3] = randomBetween(i, 1, -150, 150);
      pos[i * 3 + 1] = randomBetween(i, 2, -100, 100);
      pos[i * 3 + 2] = randomBetween(i, 3, -10, -5);

      const temp = randomBetween(i, 4, 2500, 6500);
      const [r, g, b] = kelvinToRGB(temp);
      const brightness = randomBetween(i, 5, 0.4, 1.4);

      col[i * 3] = r * brightness;
      col[i * 3 + 1] = g * brightness;
      col[i * 3 + 2] = b * brightness;

      // Size variation (100-120%)
      const baseSize = 0.001;
      size[i] = baseSize * randomBetween(i, 6, 1.0, 1.2);
    }

    return { positions: pos, colors: col, sizes: size };
  }, []);

  // Starburst stars (brighter, bigger stars with cross pattern)
  const starburstData = useMemo(() => {
    const pos = new Float32Array(starburstCount * 3);
    const col = new Float32Array(starburstCount * 3);
    const size = new Float32Array(starburstCount);

    for (let i = 0; i < starburstCount; i++) {
      pos[i * 3] = randomBetween(i, 10, -150, 150);
      pos[i * 3 + 1] = randomBetween(i, 11, -100, 100);
      pos[i * 3 + 2] = randomBetween(i, 12, -10, -5);

      const temp = randomBetween(i, 13, 2500, 6500);
      const [r, g, b] = kelvinToRGB(temp);
      const brightness = randomBetween(i, 14, 1.3, 1.8);

      col[i * 3] = r * brightness;
      col[i * 3 + 1] = g * brightness;
      col[i * 3 + 2] = b * brightness;

      // Bigger for starburst effect
      size[i] = 0.002 * randomBetween(i, 15, 1.2, 1.5);
    }

    return { positions: pos, colors: col, sizes: size };
  }, []);

  // Parallax scrolling based on star size (bigger = closer = faster)
  useFrame((state, delta) => {
    // Scroll regular stars - speed based on size
    if (regularStarsRef.current) {
      const positions = regularStarsRef.current.geometry.attributes.position.array as Float32Array;
      const starSizes = regularStarsRef.current.geometry.attributes.size.array as Float32Array;
      const wrapCounts = regularWraps.current;

      for (let i = 0; i < starCount; i++) {
        // Parallax: bigger stars (closer) move faster
        const sizeFactor = starSizes[i] / 0.001; // Normalize around base size
        const speed = 2 + sizeFactor * 3; // 2 to 5 units/sec based on size

        positions[i * 3] -= delta * speed;

        // Wrap when offscreen on left
        if (positions[i * 3] < -150) {
          positions[i * 3] = 150;
          wrapCounts[i] += 1;
          positions[i * 3 + 1] = randomBetween(i, 16, -100, 100, wrapCounts[i]);
        }
      }

      regularStarsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Scroll starburst stars - faster (they're bigger/closer)
    if (starburstStarsRef.current) {
      const positions = starburstStarsRef.current.geometry.attributes.position.array as Float32Array;
      const starSizes = starburstStarsRef.current.geometry.attributes.size.array as Float32Array;
      const wrapCounts = starburstWraps.current;

      for (let i = 0; i < starburstCount; i++) {
        // Starburst stars are closer, move faster
        const sizeFactor = starSizes[i] / 0.002;
        const speed = 5 + sizeFactor * 4; // 5 to 9 units/sec

        positions[i * 3] -= delta * speed;

        // Wrap when offscreen
        if (positions[i * 3] < -150) {
          positions[i * 3] = 150;
          wrapCounts[i] += 1;
          positions[i * 3 + 1] = randomBetween(i, 17, -100, 100, wrapCounts[i]);
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

      {/* Contrail afterimage (progressive fade from old to new) */}
      {contrailFade > 0 && (
        <Line
          points={contrailPoints}
          vertexColors={[
            [color[0] * 0.2 * contrailFade, color[1] * 0.2 * contrailFade, color[2] * 0.2 * contrailFade], // Old end - very faded
            [color[0] * 1.5 * contrailFade, color[1] * 1.5 * contrailFade, color[2] * 1.5 * contrailFade], // New end - bright
          ]}
          lineWidth={4}
          transparent
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

/**
 * Create a realistic spiral galaxy texture
 * (Currently commented out - not in use)
 */
/*function createGalaxyTexture(size: number): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = size / 2;

  // Create spiral galaxy pattern
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      
      const idx = (y * size + x) * 4;
      
      if (distance > maxRadius) {
        data[idx] = 0;     // R
        data[idx + 1] = 0; // G
        data[idx + 2] = 0; // B
        data[idx + 3] = 0; // A
        continue;
      }

      // Central core - flattened elliptical bar, not a sphere
      // Galaxies have a central bar/bulge that's elongated, not circular
      const barLength = maxRadius * 0.2;
      const barWidth = maxRadius * 0.06; // Much thinner bar
      const barDistance = Math.sqrt((dx / barLength) ** 2 + (dy / barWidth) ** 2);
      let intensity = 0;
      
      if (barDistance < 1) {
        // Bright central bar - elongated, not spherical - blue-white core
        intensity = 0.6 * (1 - barDistance);
        // Gradient from center outward - blue-white, not yellow
        const centerFalloff = Math.min(1, barDistance * 1.5);
        data[idx] = Math.min(255, 220 * (1 - centerFalloff * 0.2));     // R - less red
        data[idx + 1] = Math.min(255, 240 * (1 - centerFalloff * 0.2)); // G
        data[idx + 2] = Math.min(255, 255 * (1 - centerFalloff * 0.2)); // B - more blue
      } else {
        // Spiral arms pattern
        const normalizedDistance = (distance - barLength) / (maxRadius - barLength);
        const spiralAngle = angle + Math.log(Math.max(1, distance / barLength)) * 2.5; // Logarithmic spiral
        const spiralValue = (Math.sin(spiralAngle * 2) + 1) / 2; // 0-1 wave pattern
        
        // Spiral arms with falloff - make arms more visible and glowing
        const armIntensity = spiralValue * Math.pow(1 - normalizedDistance, 1.2);
        intensity = armIntensity * 0.8; // Increased for more glow
        
        // Galaxy colors: blue/cyan in arms, transitioning to white near core
        const colorMix = Math.min(1, normalizedDistance * 2);
        const blue = Math.min(255, 180 + intensity * 60 + (1 - colorMix) * 75); // More blue/cyan
        const green = Math.min(255, 200 + intensity * 50 + (1 - colorMix) * 55); // Cyan tint
        const red = Math.min(255, 220 + intensity * 30 + (1 - colorMix) * 35); // Less red, more blue-white
        
        data[idx] = red;
        data[idx + 1] = green;
        data[idx + 2] = blue;
      }
      
      // Add subtle noise for realism
      const noise = (Math.random() - 0.5) * 12;
      data[idx] = Math.max(0, Math.min(255, data[idx] + noise));
      data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + noise));
      data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + noise));
      data[idx + 3] = Math.min(255, intensity * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}*/

/**
 * Create a realistic nebula texture with wispy cloud-like structures
 * (Currently commented out - not in use)
 */
/*function createNebulaTexture(size: number, primaryColor: [number, number, number], secondaryColor: [number, number, number]): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(size, size);
  const data = imageData.data;
  const centerX = size / 2;
  const centerY = size / 2;

  // Create wispy cloud-like nebula pattern using Perlin-like noise simulation
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x - centerX) / size;
      const dy = (y - centerY) / size;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const idx = (y * size + x) * 4;
      
      // Create turbulent, wispy patterns using multiple sine waves
      const scale1 = 3;
      const scale2 = 7;
      const scale3 = 15;
      
      const noise1 = Math.sin(dx * scale1 + Math.cos(dy * scale1 * 1.3)) * 0.5 + 0.5;
      const noise2 = Math.sin(dx * scale2 + Math.cos(dy * scale2 * 0.7)) * 0.5 + 0.5;
      const noise3 = Math.sin(dx * scale3 + Math.cos(dy * scale3 * 1.1)) * 0.5 + 0.5;
      
      // Combine noise layers for cloud-like structure
      const cloud = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2);
      
      // Radial falloff from center
      const radialFalloff = Math.max(0, 1 - distance * 1.2);
      const intensity = cloud * radialFalloff;
      
      // Blend between primary and secondary colors based on position
      const colorMix = (Math.sin(dx * 5) + 1) / 2;
      const r = primaryColor[0] * (1 - colorMix) + secondaryColor[0] * colorMix;
      const g = primaryColor[1] * (1 - colorMix) + secondaryColor[1] * colorMix;
      const b = primaryColor[2] * (1 - colorMix) + secondaryColor[2] * colorMix;
      
      // Add intensity variation for wispy effect and glow
      const finalIntensity = intensity * (0.8 + 0.2 * Math.sin(dx * 8 + dy * 6));

      // Increase brightness for glow effect
      data[idx] = Math.min(255, r * finalIntensity * 1.2);
      data[idx + 1] = Math.min(255, g * finalIntensity * 1.2);
      data[idx + 2] = Math.min(255, b * finalIntensity * 1.2);
      data[idx + 3] = Math.min(255, finalIntensity * 220); // Increased alpha for glow // Semi-transparent
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}*/

/**
 * Distant Galaxy - spiral galaxy slowly scrolling in the far background
 * (Currently commented out - not in use)
 */
/*function DistantGalaxy({ position, size, speed, rotation }: {
  position: [number, number, number];
  size: number;
  speed: number;
  rotation: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createGalaxyTexture(512), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Galaxies are so distant they move with the background stars
      // Match the slowest star speed (2 units/sec) but even slower for parallax
      // At this distance, they should appear almost static, moving with background
      meshRef.current.position.x -= delta * speed;
      
      // Wrap around when off-screen - wider range for spread out objects
      if (meshRef.current.position.x < -500) {
        meshRef.current.position.x = 500;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[Math.PI / 6, 0, rotation]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.6} // More visible, translucent glow
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}*/

/**
 * Distant Nebula - wispy gas cloud slowly scrolling in the far background
 * (Currently commented out - not in use)
 */
/*function DistantNebula({ position, primaryColor, secondaryColor, size, speed }: {
  position: [number, number, number];
  primaryColor: [number, number, number];
  secondaryColor: [number, number, number];
  size: number;
  speed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createNebulaTexture(512, primaryColor, secondaryColor), [primaryColor, secondaryColor]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Nebulae are so distant they move with the background stars
      // Match the slowest star speed but even slower for parallax
      // At this distance, they should appear almost static, moving with background
      meshRef.current.position.x -= delta * speed;
      
      // Wrap around when off-screen - wider range for spread out objects
      if (meshRef.current.position.x < -500) {
        meshRef.current.position.x = 500;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position} rotation={[Math.PI / 6, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.65} // More visible, translucent glow
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}*/

/*function DistantGalaxies() {
  // Create realistic galaxies and nebulae - mid-ground, large, translucent, glowing
  // Colors: blue, cyan, pink/purple - soft and ethereal
  const celestialObjects = useMemo(() => [
    // Large Spiral Galaxy - blue/cyan (left side, mid-ground)
    {
      type: 'galaxy' as const,
      position: [-200, 80, -400] as [number, number, number], // Mid-ground, not too far
      size: 500, // Large and prominent
      speed: 0.3, // Slow drift
      rotation: Math.PI / 6,
    },
    // Spiral Galaxy - tilted (right side, mid-ground)
    {
      type: 'galaxy' as const,
      position: [250, -60, -450] as [number, number, number],
      size: 480,
      speed: 0.35,
      rotation: -Math.PI / 5,
    },
    // Spiral Galaxy - edge-on (top center, mid-ground)
    {
      type: 'galaxy' as const,
      position: [0, 140, -420] as [number, number, number],
      size: 460,
      speed: 0.28,
      rotation: Math.PI / 2,
    },
    // Nebula - pink/purple (right center, mid-ground)
    {
      type: 'nebula' as const,
      position: [180, 40, -380] as [number, number, number],
      primaryColor: [255, 120, 200] as [number, number, number], // Pink
      secondaryColor: [200, 150, 255] as [number, number, number], // Purple
      size: 520,
      speed: 0.32,
    },
    // Nebula - cyan/blue (left top, mid-ground)
    {
      type: 'nebula' as const,
      position: [-220, 120, -430] as [number, number, number],
      primaryColor: [100, 220, 255] as [number, number, number], // Cyan
      secondaryColor: [150, 200, 255] as [number, number, number], // Blue
      size: 480,
      speed: 0.3,
    },
    // Nebula - blue/purple (bottom right, mid-ground)
    {
      type: 'nebula' as const,
      position: [200, -100, -410] as [number, number, number],
      primaryColor: [120, 180, 255] as [number, number, number], // Blue
      secondaryColor: [200, 140, 255] as [number, number, number], // Purple
      size: 440,
      speed: 0.33,
    },
    // Spiral Galaxy - small tilted (bottom left, slightly further)
    {
      type: 'galaxy' as const,
      position: [-180, -90, -500] as [number, number, number],
      size: 380,
      speed: 0.25,
      rotation: -Math.PI / 4,
    },
    // Nebula - cyan/pink blend (center, mid-ground)
    {
      type: 'nebula' as const,
      position: [-50, -20, -390] as [number, number, number],
      primaryColor: [150, 230, 255] as [number, number, number], // Cyan
      secondaryColor: [255, 180, 220] as [number, number, number], // Pink
      size: 460,
      speed: 0.31,
    },
  ], []);

  return (
    <>
      {celestialObjects.map((obj, i) => {
        if (obj.type === 'galaxy') {
          return (
            <DistantGalaxy
              key={`galaxy-${i}`}
              position={obj.position}
              size={obj.size}
              speed={obj.speed}
              rotation={obj.rotation}
            />
          );
        } else {
          return (
            <DistantNebula
              key={`nebula-${i}`}
              position={obj.position}
              primaryColor={obj.primaryColor}
              secondaryColor={obj.secondaryColor}
              size={obj.size}
              speed={obj.speed}
            />
          );
        }
      })}
    </>
  );
}*/

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
