/**
 * USS Enterprise NCC-1701 Flyby
 * Loads GLB model and animates across starfield
 */

'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function Enterprise() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/enterprise.glb');

  // Cinematic flyby - smooth entry, then WARP SPEED exit!
  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;

      // Flyby cycle: 40s approach + warp exit
      const cycleTime = 41;
      const progress = (time % cycleTime) / cycleTime;

      // Smooth ease for approach
      const easeInOutQuad = (t: number) => {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      };

      if (progress < 0.95) {
        // Normal flight (0-95%)
        const flightProgress = progress / 0.95;
        const smoothProgress = easeInOutQuad(flightProgress);

        // Continuous Z movement (far to close)
        groupRef.current.position.z = -600 + smoothProgress * 550; // -600 to -50

        // Smooth curved X path
        groupRef.current.position.x = -50 + Math.sin(smoothProgress * Math.PI) * 80;

        // Smooth arc
        groupRef.current.position.y = 20 + Math.sin(smoothProgress * Math.PI) * 50;

        // Smooth rotation and banking
        groupRef.current.rotation.y = Math.PI * (0.05 + smoothProgress * 0.25);
        groupRef.current.rotation.z = -Math.sin(smoothProgress * Math.PI) * 0.12;
        groupRef.current.rotation.x = -Math.PI * 0.05 + Math.sin(smoothProgress * Math.PI) * 0.02;

      } else {
        // WARP SPEED! (95-100%) - extreme acceleration
        const warpProgress = (progress - 0.95) / 0.05;

        // Exponential acceleration (feels like instant jump to warp)
        const warpSpeed = Math.pow(warpProgress, 3) * 3000;

        // Continue from current position, just accelerate rightward
        groupRef.current.position.x += delta * warpSpeed;
        groupRef.current.position.z += delta * warpSpeed * 0.3;

        // Smoothly transition rotation (ease into warp direction)
        const currentY = groupRef.current.rotation.y;
        const currentZ = groupRef.current.rotation.z;
        const targetY = Math.PI * 0.4;
        const targetZ = -Math.PI * 0.15;

        groupRef.current.rotation.y += (targetY - currentY) * 0.05;
        groupRef.current.rotation.z += (targetZ - currentZ) * 0.05;
        groupRef.current.rotation.x += (0 - groupRef.current.rotation.x) * 0.05;
      }
    }
  });

  return (
    <group ref={groupRef} scale={5}>
      <primitive object={scene} />
    </group>
  );
}
