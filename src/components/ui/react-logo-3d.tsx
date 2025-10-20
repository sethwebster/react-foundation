"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

function ReactAtom() {
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

      const currentOuterSpeed = baseOuterSpeed * smoothMultiplier;

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


function Scene() {
  return (
    <>
      <OrthographicCamera makeDefault position={[0, -1.5, 10]} zoom={100} />

      {/* Minimal ambient light */}
      <ambientLight intensity={0.05} />

      {/* Spinning neon React logo */}
      <ReactAtom />

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

export function ReactLogo3D() {
  return (
    <Canvas
      shadows
      gl={{ alpha: true, antialias: true }}
      style={{
        width: '100%',
        height: '100%',
        background: 'transparent',
        display: 'block',
      }}
      dpr={typeof window !== 'undefined' ? window.devicePixelRatio : 1}
    >
      <Scene />
    </Canvas>
  );
}
