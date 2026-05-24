"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 130;
const LINK_DISTANCE = 0.85;
const MAX_LINKS = PARTICLE_COUNT * 4;
const SPAWN_RANGE_X = 3.2;
const SPAWN_RANGE_Y = 3.2;
const SPAWN_RANGE_Z = 1.2;

const INK = new THREE.Color("#141414");
const ACID = new THREE.Color("#E4FF3A");

function ParticleSystem() {
  const points = useRef<THREE.Points>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const { pointer, viewport } = useThree();

  const {
    positions,
    basePositions,
    sizes,
    colors,
    drift,
    linePositions,
    lineColors,
  } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const basePositions = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const drift = new Float32Array(PARTICLE_COUNT * 2);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * SPAWN_RANGE_X;
      const y = (Math.random() - 0.5) * SPAWN_RANGE_Y;
      const z = (Math.random() - 0.5) * SPAWN_RANGE_Z;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      basePositions[i * 3] = x;
      basePositions[i * 3 + 1] = y;
      basePositions[i * 3 + 2] = z;
      sizes[i] = Math.random() < 0.1 ? 0.06 : 0.03;
      const c = Math.random() < 0.12 ? ACID : INK;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      drift[i * 2] = Math.random() * Math.PI * 2;
      drift[i * 2 + 1] = 0.3 + Math.random() * 0.5;
    }

    const linePositions = new Float32Array(MAX_LINKS * 6);
    const lineColors = new Float32Array(MAX_LINKS * 6);

    return {
      positions,
      basePositions,
      sizes,
      colors,
      drift,
      linePositions,
      lineColors,
    };
  }, []);

  useFrame((state) => {
    if (!points.current || !lines.current) return;

    const t = state.clock.getElapsedTime();
    const mx = pointer.x * (viewport.width / 2);
    const my = pointer.y * (viewport.height / 2);

    const posAttr = points.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const pArr = posAttr.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const phase = drift[i * 2];
      const speed = drift[i * 2 + 1];
      const driftX = Math.sin(t * speed + phase) * 0.05;
      const driftY = Math.cos(t * speed * 0.8 + phase) * 0.05;

      const target = {
        x: basePositions[i3] + driftX,
        y: basePositions[i3 + 1] + driftY,
        z: basePositions[i3 + 2],
      };

      // Cursor repulsion
      const dx = pArr[i3] - mx;
      const dy = pArr[i3 + 1] - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = Math.max(0, 1 - dist / 1.3) * 0.06;
      const nx = force > 0 ? dx / Math.max(dist, 0.001) : 0;
      const ny = force > 0 ? dy / Math.max(dist, 0.001) : 0;

      pArr[i3] += (target.x - pArr[i3]) * 0.06 + nx * force;
      pArr[i3 + 1] += (target.y - pArr[i3 + 1]) * 0.06 + ny * force;
      pArr[i3 + 2] += (target.z - pArr[i3 + 2]) * 0.06;
    }
    posAttr.needsUpdate = true;

    // Build line segments for nearby pairs
    const linePos = lines.current.geometry.attributes
      .position as THREE.BufferAttribute;
    const lineCol = lines.current.geometry.attributes
      .color as THREE.BufferAttribute;
    const lp = linePos.array as Float32Array;
    const lc = lineCol.array as Float32Array;

    let linkIdx = 0;
    const linkSqr = LINK_DISTANCE * LINK_DISTANCE;
    for (let i = 0; i < PARTICLE_COUNT && linkIdx < MAX_LINKS; i++) {
      const xi = pArr[i * 3];
      const yi = pArr[i * 3 + 1];
      const zi = pArr[i * 3 + 2];
      for (let j = i + 1; j < PARTICLE_COUNT && linkIdx < MAX_LINKS; j++) {
        const xj = pArr[j * 3];
        const yj = pArr[j * 3 + 1];
        const zj = pArr[j * 3 + 2];
        const dx = xi - xj;
        const dy = yi - yj;
        const dz = zi - zj;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < linkSqr) {
          const k = linkIdx * 6;
          lp[k] = xi;
          lp[k + 1] = yi;
          lp[k + 2] = zi;
          lp[k + 3] = xj;
          lp[k + 4] = yj;
          lp[k + 5] = zj;
          const ci = i * 3;
          const cj = j * 3;
          lc[k] = colors[ci];
          lc[k + 1] = colors[ci + 1];
          lc[k + 2] = colors[ci + 2];
          lc[k + 3] = colors[cj];
          lc[k + 4] = colors[cj + 1];
          lc[k + 5] = colors[cj + 2];
          linkIdx++;
        }
      }
    }
    linePos.needsUpdate = true;
    lineCol.needsUpdate = true;
    lines.current.geometry.setDrawRange(0, linkIdx * 2);
  });

  return (
    <>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={PARTICLE_COUNT}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
            count={PARTICLE_COUNT}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.95}
          depthWrite={false}
        />
      </points>

      <lineSegments ref={lines}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={MAX_LINKS * 2}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[lineColors, 3]}
            count={MAX_LINKS * 2}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </lineSegments>
    </>
  );
}

export function ParticleField() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.5], fov: 35 }}
      gl={{ alpha: true, antialias: true }}
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <ParticleSystem />
      </Suspense>
    </Canvas>
  );
}

export default ParticleField;
