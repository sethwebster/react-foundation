/**
 * USS Enterprise NCC-1701 Flyby
 * Loads GLB model and animates across starfield
 */

'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export function Enterprise() {
  const groupRef = useRef<THREE.Group>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  const flashWideRef = useRef<THREE.Mesh>(null);
  const flashNarrowRef = useRef<THREE.Mesh>(null);
  const flashVerticalRef = useRef<THREE.Mesh>(null);
  const pointLightRef = useRef<THREE.PointLight>(null);
  const { scene } = useGLTF('/models/enterprise.glb');
  const [hasFlashed, setHasFlashed] = useState(false);
  const flashStartTime = useRef<number | null>(null);
  const initialDelay = useRef(3); // 3 second delay before Enterprise appears

  // Cinematic flyby - smooth entry, then WARP SPEED exit!
  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Apply initial delay - don't start animation until delay has passed
      if (time < initialDelay.current) {
        groupRef.current.visible = false;
        return;
      }
      
      // Adjust time to account for delay
      const adjustedTime = time - initialDelay.current;

      // Flyby cycle: 40s approach + warp exit
      const cycleTime = 41;
      const progress = (adjustedTime % cycleTime) / cycleTime;
      
      // Camera flash effect - Enterprise appears during flash peak
      const flashTriggerProgress = 0.002; // Flash starts very early
      const flashDuration = 0.1; // 100ms flash duration (camera flash speed)
      
      // Reset flash on new cycle (but not during flash window)
      if (progress < flashTriggerProgress) {
        setHasFlashed(false);
        flashStartTime.current = null;
        
        // Ensure everything is hidden
        if (flashRef.current) flashRef.current.visible = false;
        if (flashWideRef.current) flashWideRef.current.visible = false;
        if (flashNarrowRef.current) flashNarrowRef.current.visible = false;
        if (flashVerticalRef.current) flashVerticalRef.current.visible = false;
        if (pointLightRef.current) {
          pointLightRef.current.visible = false;
          pointLightRef.current.intensity = 0;
        }
      }
      
      // Trigger flash
      if (progress >= flashTriggerProgress && progress < flashTriggerProgress + 0.01 && !hasFlashed) {
        setHasFlashed(true);
        flashStartTime.current = adjustedTime;
      }
      
      // Make Enterprise visible right when flash starts (appears under the flash)
      if (flashStartTime.current !== null) {
        const timeSinceFlash = adjustedTime - flashStartTime.current;
        // Enterprise appears immediately when flash starts (or slightly before)
        if (timeSinceFlash >= 0) {
          groupRef.current.visible = true;
        } else {
          groupRef.current.visible = false;
        }
      } else if (progress >= flashTriggerProgress + 0.01) {
        // Fallback: make visible if flash didn't trigger for some reason
        groupRef.current.visible = true;
      } else {
        groupRef.current.visible = false;
      }
      
      // Camera flash effect - quick bright flash that fades out exponentially
      // Position flash at Enterprise location
      if (flashStartTime.current !== null && groupRef.current) {
        const flashElapsed = adjustedTime - flashStartTime.current;
        
        // Get Enterprise world position for flash
        const enterprisePos = new THREE.Vector3();
        groupRef.current.getWorldPosition(enterprisePos);
        
        if (flashElapsed >= 0 && flashElapsed < flashDuration) {
          // Exponential fade out (like a camera flash)
          const t = flashElapsed / flashDuration;
          const flashIntensity = 30 * Math.exp(-t * 4); // Exponential decay, very bright start
          
          // Position flash meshes at Enterprise location
          if (flashRef.current) {
            flashRef.current.position.copy(enterprisePos);
            flashRef.current.visible = true;
            const material = flashRef.current.material as THREE.MeshBasicMaterial;
            if (material) {
              material.opacity = Math.max(0.2, flashIntensity * 0.7);
              material.needsUpdate = true;
            }
          }
          if (flashWideRef.current) {
            flashWideRef.current.position.copy(enterprisePos);
            flashWideRef.current.visible = true;
            const material = flashWideRef.current.material as THREE.MeshBasicMaterial;
            if (material) {
              material.opacity = Math.max(0.2, flashIntensity * 0.6);
              material.needsUpdate = true;
            }
          }
          if (flashNarrowRef.current) {
            flashNarrowRef.current.position.copy(enterprisePos);
            flashNarrowRef.current.visible = true;
            const material = flashNarrowRef.current.material as THREE.MeshBasicMaterial;
            if (material) {
              material.opacity = Math.max(0.2, flashIntensity * 0.8);
              material.needsUpdate = true;
            }
          }
          if (flashVerticalRef.current) {
            flashVerticalRef.current.position.copy(enterprisePos);
            flashVerticalRef.current.visible = true;
            const material = flashVerticalRef.current.material as THREE.MeshBasicMaterial;
            if (material) {
              material.opacity = Math.max(0.2, flashIntensity * 0.5);
              material.needsUpdate = true;
            }
          }
          if (pointLightRef.current) {
            pointLightRef.current.position.copy(enterprisePos);
            pointLightRef.current.intensity = flashIntensity * 6;
            pointLightRef.current.visible = true;
          }
        } else {
          // Flash is done, hide everything
          flashStartTime.current = null;
          
          if (flashRef.current) flashRef.current.visible = false;
          if (flashWideRef.current) flashWideRef.current.visible = false;
          if (flashNarrowRef.current) flashNarrowRef.current.visible = false;
          if (flashVerticalRef.current) flashVerticalRef.current.visible = false;
          if (pointLightRef.current) {
            pointLightRef.current.visible = false;
            pointLightRef.current.intensity = 0;
          }
        }
      }

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
    <>
      <group ref={groupRef} scale={5} renderOrder={1000}>
        <primitive object={scene} renderOrder={1000} />
      </group>
      
      {/* Flash effects positioned at Enterprise location - separate from Enterprise group */}
      {/* Main horizontal anamorphic streak */}
      <mesh ref={flashRef} position={[0, 0, 0]} visible={false} rotation={[0, 0, 0]}>
        <planeGeometry args={[20, 0.5, 1, 1]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Additional dramatic streaks for warp-in effect */}
      {/* Very wide horizontal streak */}
      <mesh ref={flashWideRef} position={[0, 0, 0]} rotation={[0, 0, 0]} visible={false}>
        <planeGeometry args={[30, 0.4, 1, 1]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Narrow bright horizontal streak */}
      <mesh ref={flashNarrowRef} position={[0, 0, 0]} rotation={[0, 0, 0]} visible={false}>
        <planeGeometry args={[15, 0.2, 1, 1]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Vertical streak (cross pattern) */}
      <mesh ref={flashVerticalRef} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} visible={false}>
        <planeGeometry args={[8, 0.2, 1, 1]} />
        <meshBasicMaterial
          color={0xffffff}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Point light for flash */}
      <pointLight
        ref={pointLightRef}
        position={[0, 0, 0]}
        intensity={0}
        color={0xffffff}
        distance={20}
        decay={2}
        visible={false}
      />
    </>
  );
}

// Preload the model
useGLTF.preload('/models/enterprise.glb');
