"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  MeshTransmissionMaterial,
  Float,
  ContactShadows,
} from "@react-three/drei";
import { Suspense } from "react";
import type { Mesh, Group } from "three";

function GlassShape() {
  const group = useRef<Group>(null);
  const mesh = useRef<Mesh>(null);

  useFrame(({ pointer, clock }) => {
    if (!group.current || !mesh.current) return;
    const t = clock.getElapsedTime();
    // Subtle cursor-follow rotation
    group.current.rotation.y +=
      (pointer.x * 0.6 - group.current.rotation.y) * 0.04;
    group.current.rotation.x +=
      (-pointer.y * 0.35 - group.current.rotation.x) * 0.04;
    // Idle drift
    mesh.current.rotation.z = Math.sin(t * 0.3) * 0.15;
  });

  return (
    <group ref={group}>
      <Float speed={1.1} rotationIntensity={0.4} floatIntensity={0.8}>
        <mesh ref={mesh} castShadow>
          <torusKnotGeometry args={[1, 0.35, 220, 32]} />
          <MeshTransmissionMaterial
            backside
            samples={3}
            resolution={512}
            thickness={0.25}
            chromaticAberration={0.08}
            anisotropicBlur={0.2}
            distortion={0.15}
            distortionScale={0.4}
            temporalDistortion={0.08}
            ior={1.25}
            color="#ffffff"
            attenuationDistance={4}
            attenuationColor="#E4FF3A"
            roughness={0.05}
            transmission={1}
          />
        </mesh>
      </Float>

      {/* Floating acid yellow shard */}
      <Float speed={0.8} rotationIntensity={0.6} floatIntensity={1.2}>
        <mesh position={[1.7, -0.6, -1.2]} rotation={[0.3, 0.4, 0.2]}>
          <octahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial
            color="#E4FF3A"
            emissive="#E4FF3A"
            emissiveIntensity={0.35}
            roughness={0.3}
            metalness={0.05}
          />
        </mesh>
      </Float>

      {/* Ink rod — kept dark for brutalist contrast */}
      <Float speed={0.9} rotationIntensity={0.5} floatIntensity={0.9}>
        <mesh position={[-1.8, 0.8, -0.6]} rotation={[0.6, 0.2, 0.5]}>
          <cylinderGeometry args={[0.06, 0.06, 1.6, 12]} />
          <meshStandardMaterial color="#141414" roughness={0.55} />
        </mesh>
      </Float>
    </group>
  );
}

export function GlassCentrepiece() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.25]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 4.5], fov: 38 }}
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <ambientLight intensity={1.1} />
        <directionalLight
          position={[3, 4, 2]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-3, -1, -2]} intensity={0.5} />

        <GlassShape />

        <ContactShadows
          position={[0, -1.6, 0]}
          opacity={0.28}
          scale={6}
          blur={2.4}
          far={3}
        />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}

export default GlassCentrepiece;
