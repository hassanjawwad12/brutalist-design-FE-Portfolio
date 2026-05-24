"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { Text } from "@react-three/drei";
import { skills, type Skill } from "@/data/skills";
import * as THREE from "three";

const DRAG_PLANE = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

interface ChipProps {
  skill: Skill;
  spawn: [number, number, number];
}

function SkillChip({ skill, spawn }: ChipProps) {
  const body = useRef<RapierRigidBody>(null);
  const { camera, pointer, raycaster } = useThree();
  const [hovered, setHovered] = useState(false);
  const [dragging, setDragging] = useState(false);
  const target = useMemo(() => new THREE.Vector3(), []);
  const grabOffset = useMemo(() => new THREE.Vector3(), []);

  const colour = useMemo(() => {
    switch (skill.group) {
      case "frontend":
        return "#141414";
      case "backend":
        return "#E4FF3A";
      case "data":
        return "#B8C4D6";
      case "tooling":
        return "#EDEAE3";
      default:
        return "#141414";
    }
  }, [skill.group]);

  const textColour = useMemo(() => {
    return skill.group === "frontend" ? "#EDEAE3" : "#141414";
  }, [skill.group]);

  const size = useMemo(() => {
    const base = 0.55 + skill.weight * 0.09;
    return [base * 1.6, base, 0.18] as const;
  }, [skill.weight]);

  // Release on global pointerup so we never lose grab
  useEffect(() => {
    if (!dragging) return;
    const release = () => {
      setDragging(false);
      document.body.style.cursor = "auto";
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [dragging]);

  useFrame((_, dt) => {
    if (!dragging || !body.current) return;
    raycaster.setFromCamera(pointer, camera);
    if (raycaster.ray.intersectPlane(DRAG_PLANE, target)) {
      target.sub(grabOffset);
      const cur = body.current.translation();
      const stepDt = Math.max(dt, 1 / 120);
      body.current.setLinvel(
        {
          x: ((target.x - cur.x) / stepDt) * 0.55,
          y: ((target.y - cur.y) / stepDt) * 0.55,
          z: 0,
        },
        true
      );
      body.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  });

  return (
    <RigidBody
      ref={body}
      position={spawn}
      restitution={0.32}
      friction={0.55}
      linearDamping={dragging ? 4 : 0.3}
      angularDamping={dragging ? 4 : 0.5}
      colliders={false}
      enabledTranslations={[true, true, false]}
      enabledRotations={[false, false, true]}
    >
      <group
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "grab";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          if (!dragging) document.body.style.cursor = "auto";
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (!body.current) return;
          setDragging(true);
          document.body.style.cursor = "grabbing";
          raycaster.setFromCamera(pointer, camera);
          if (raycaster.ray.intersectPlane(DRAG_PLANE, target)) {
            const t = body.current.translation();
            grabOffset.copy(target).sub(new THREE.Vector3(t.x, t.y, t.z));
          } else {
            grabOffset.set(0, 0, 0);
          }
        }}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[size[0], size[1], size[2]]} />
          <meshStandardMaterial
            color={colour}
            roughness={0.45}
            metalness={0.05}
            emissive={hovered ? colour : "#000000"}
            emissiveIntensity={hovered ? 0.15 : 0}
          />
        </mesh>
        <Text
          position={[0, 0, size[2] / 2 + 0.002]}
          fontSize={Math.min(size[1] * 0.22, 0.14)}
          color={textColour}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.04}
          maxWidth={size[0] * 0.9}
        >
          {skill.label.toUpperCase()}
        </Text>
      </group>
      <CuboidCollider args={[size[0] / 2, size[1] / 2, size[2] / 2]} />
    </RigidBody>
  );
}

function Walls() {
  const { viewport } = useThree();
  const w = viewport.width / 2;
  const h = viewport.height / 2;
  return (
    <>
      <RigidBody type="fixed" position={[0, -h - 0.1, 0]} colliders={false}>
        <CuboidCollider args={[w * 2, 0.1, 5]} />
      </RigidBody>
      <RigidBody type="fixed" position={[-w - 0.1, 0, 0]} colliders={false}>
        <CuboidCollider args={[0.1, h * 2, 5]} />
      </RigidBody>
      <RigidBody type="fixed" position={[w + 0.1, 0, 0]} colliders={false}>
        <CuboidCollider args={[0.1, h * 2, 5]} />
      </RigidBody>
      {/* No ceiling — chips fall in from above */}
    </>
  );
}

function Scene() {
  const { viewport } = useThree();
  const halfW = viewport.width / 2;
  const spawns: Array<[number, number, number]> = useMemo(
    () =>
      skills.map((_, i) => [
        (Math.random() - 0.5) * Math.max(halfW * 1.6, 2),
        viewport.height / 2 + 1 + i * 0.6,
        0,
      ]),
    // Re-spawn when viewport size becomes available
    [halfW, viewport.height]
  );

  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[2, 5, 3]}
        intensity={1.05}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <Walls />
      {skills.map((s, i) => (
        <SkillChip key={s.id} skill={s} spawn={spawns[i]} />
      ))}
    </>
  );
}

export function SkillsPhysics() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <Physics gravity={[0, -6, 0]}>
          <Scene />
        </Physics>
      </Suspense>
    </Canvas>
  );
}

export default SkillsPhysics;
