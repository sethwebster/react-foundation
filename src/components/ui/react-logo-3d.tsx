"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function ReactAtom({ onSpeedChange, speedModifier }: { onSpeedChange?: (speed: number) => void; speedModifier?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const nucleusRef = useRef<THREE.Mesh>(null);
  const orbit1Ref = useRef<THREE.Group>(null);
  const orbit2Ref = useRef<THREE.Group>(null);
  const orbit3Ref = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const [isPaused, setIsPaused] = useState(false);

  useFrame((state, delta) => {
    if (!isPaused) {
      const time = state.clock.elapsedTime;

      // Progressive acceleration: +10% every 5 seconds, with smooth interpolation
      const baseOuterSpeed = 0.45;
      const interval = 5; // seconds between speed increases
      const currentStep = Math.floor(time / interval);
      const stepProgress = (time % interval) / interval; // 0 to 1 within current step

      // Interpolate between current and next speed step
      const currentMultiplier = 1 + (currentStep * 0.1);
      const nextMultiplier = 1 + ((currentStep + 1) * 0.1);
      const smoothMultiplier = currentMultiplier + (nextMultiplier - currentMultiplier) * stepProgress;

      // Apply keyboard speed modifier (default 1.0)
      const finalMultiplier = smoothMultiplier * (speedModifier || 1);
      const currentOuterSpeed = baseOuterSpeed * finalMultiplier;

      // Notify parent of speed change for glow effect
      onSpeedChange?.(finalMultiplier);

      // Smoothly increment rotation using delta time
      if (groupRef.current) {
        groupRef.current.rotation.y += delta * currentOuterSpeed;
      }

      // Nucleus rotates with the group (no counter-rotation)

      // Each ellipse rotates around its own long axis (X-axis)
      const currentEllipseSpeed = currentOuterSpeed * 2; // 2x faster

      if (orbit1Ref.current) {
        orbit1Ref.current.rotation.x += delta * currentEllipseSpeed;
      }
      if (orbit2Ref.current) {
        orbit2Ref.current.rotation.x += delta * currentEllipseSpeed;
      }
      if (orbit3Ref.current) {
        orbit3Ref.current.rotation.x += delta * currentEllipseSpeed;
      }

      // Dramatic neon flickering effect
      if (lightRef.current) {
        const baseIntensity = 15;
        // More frequent and dramatic flickering
        const flicker = Math.random() < 0.3 ? Math.random() * -8 : 0; // 30% chance to flicker hard
        const pulse = Math.sin(time * 3) * 3;
        lightRef.current.intensity = Math.max(2, baseIntensity + pulse + flicker);
      }
    }
  });

  // React logo proportions: 9:2 ratio for ellipse (wide and narrow) - 20% smaller
  const orbitRadiusX = 2.24; // 2.8 * 0.8
  const orbitRadiusY = 1.0; // 1.25 * 0.8

  return (
    <group
      ref={groupRef}
      onClick={() => setIsPaused(!isPaused)}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Core dodecahedron - bright neon cyan - 20% smaller */}
      <mesh ref={nucleusRef} castShadow>
        <dodecahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial
          color="rgb(97, 219, 251)"
          emissive="rgb(97, 219, 251)"
          emissiveIntensity={3}
          metalness={0}
          roughness={0.2}
          toneMapped={false}
        />
      </mesh>

      {/* Three elliptical orbits at 0°, 60°, 120° - each rotates on its own Y-axis */}
      {[
        { yRotation: 0, ref: orbit1Ref },
        { yRotation: 60, ref: orbit2Ref },
        { yRotation: 120, ref: orbit3Ref },
      ].map(({ yRotation, ref }, i) => {
        // Create ellipse in XZ plane
        const curve = new THREE.EllipseCurve(
          0, 0,                    // center
          orbitRadiusX, orbitRadiusY,  // x radius, y radius
          0, 2 * Math.PI,          // start angle, end angle
          false,                   // clockwise
          0                        // rotation
        );

        const points = curve.getPoints(128);
        const path = new THREE.CatmullRomCurve3(
          points.map((p) => new THREE.Vector3(p.x, p.y, 0))
        );

        return (
          <group
            key={i}
            ref={ref}
            rotation={[Math.PI / 2, (yRotation * Math.PI) / 180, 0]}
          >
            {/* Outer soft glow - ultra soft */}
            <mesh>
              <tubeGeometry args={[path, 128, 0.2, 16, true]} />
              <meshBasicMaterial
                color="rgb(97, 219, 251)"
                transparent
                opacity={0.08}
                toneMapped={false}
              />
            </mesh>

            {/* Inner neon tube - super bright - 10% smaller */}
            <mesh castShadow>
              <tubeGeometry args={[path, 128, 0.072, 16, true]} />
              <meshStandardMaterial
                color="rgb(97, 219, 251)"
                emissive="rgb(97, 219, 251)"
                emissiveIntensity={12}
                metalness={0}
                roughness={0}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}

      {/* Point light attached to logo */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 0]}
        intensity={5}
        distance={30}
        color="#61dafb"
        castShadow
        decay={1.5}
      />
    </group>
  );
}


function Scene({ onSpeedChange, speedModifier, scale = 1 }: { onSpeedChange?: (speed: number) => void; speedModifier?: number; scale?: number }) {
  return (
    <>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={100 * scale} />

      {/* Minimal ambient light */}
      <ambientLight intensity={0.05} />

      {/* Spinning neon React logo */}
      <group scale={scale}>
        <ReactAtom onSpeedChange={onSpeedChange} speedModifier={speedModifier} />
      </group>

      {/* Bloom post-processing - ultra soft glow */}
      <EffectComposer>
        <Bloom
          intensity={0.3}
          luminanceThreshold={0.05}
          luminanceSmoothing={0.99}
          radius={0.2}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export function ReactLogo3D({ scale = 1 }: { scale?: number }) {
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [keyboardSpeedModifier, setKeyboardSpeedModifier] = useState(1);

  // Keyboard controls: Up/Down arrows increase/decrease speed by 10%
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setKeyboardSpeedModifier(prev => prev * 1.1); // Increase by 10%
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setKeyboardSpeedModifier(prev => Math.max(0.1, prev * 0.9)); // Decrease by 10%, min 0.1x
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate glow intensity based on speed
  // Speed starts at 1.0 and increases by 0.1 every 5 seconds
  // Glow emanates from atom center, making it more visible as speed increases
  const glowIntensity = Math.min(1, Math.max(0, (speedMultiplier - 1) / 8)); // 0 to 1 over 8x speed increase

  // Expand dramatically from center - at terminal velocity fills the screen
  const glowSize = 400 + (glowIntensity * 3000); // 400px to 3400px (viewport-filling at max)
  const glowOpacity = Math.pow(glowIntensity, 0.5) * 0.95; // Power curve for dramatic growth
  const glowBlur = 80 + (glowIntensity * 220); // 80px to 300px blur - VERY fuzzy

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Fuzzy expanding glow - emanates from atom center */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: `${glowSize}px`,
          height: `${glowSize}px`,
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(circle,
            rgba(97, 219, 251, ${0.9 * glowIntensity}) 0%,
            rgba(97, 219, 251, ${0.7 * glowIntensity}) 8%,
            rgba(97, 219, 251, ${0.5 * glowIntensity}) 18%,
            rgba(97, 219, 251, ${0.25 * glowIntensity}) 35%,
            rgba(97, 219, 251, ${0.08 * glowIntensity}) 55%,
            transparent 75%)`,
          filter: `blur(${glowBlur}px)`,
          opacity: glowOpacity,
          pointerEvents: 'none',
          zIndex: 1,
          animation: glowIntensity > 0.7 ? 'pulse 1.8s ease-in-out infinite' : 'none',
        }}
      />

      {/* 3D Canvas */}
      <Canvas
        shadows
        gl={{ alpha: true, antialias: true }}
        style={{
          width: '100%',
          height: '100%',
          background: 'transparent',
          display: 'block',
          position: 'relative',
          zIndex: 2,
        }}
        dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
      >
        <Scene onSpeedChange={setSpeedMultiplier} speedModifier={keyboardSpeedModifier} scale={scale} />
      </Canvas>
    </div>
  );
}
