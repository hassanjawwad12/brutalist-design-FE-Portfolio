"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Physics,
  RigidBody,
  CuboidCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { Html, RoundedBox } from "@react-three/drei";
import { skills, type Skill } from "@/data/skills";
import { GROUP_META } from "./groups";

export type ChipApi = Map<string, RapierRigidBody>;
export type ApiRef = { current: ChipApi };

interface SceneProps {
  apiRef: ApiRef;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function Chip({
  skill,
  position,
  apiRef,
}: {
  skill: Skill;
  position: [number, number, number];
  apiRef: ApiRef;
}) {
  const body = useRef<RapierRigidBody>(null);
  const color = GROUP_META[skill.group].color;
  // Width scales with the skill weight; height/depth stay constant so chips read
  // as little nameplates.
  const width = 0.9 + skill.weight * 0.34;
  const height = 0.6;
  const depth = 0.34;

  useEffect(() => {
    const map = apiRef.current;
    if (body.current) map.set(skill.id, body.current);
    return () => {
      map.delete(skill.id);
    };
  }, [apiRef, skill.id]);

  const poke = () => {
    body.current?.applyImpulse(
      { x: rand(-2.5, 2.5), y: rand(4, 7), z: rand(-2.5, 2.5) },
      true,
    );
    body.current?.applyTorqueImpulse(
      { x: rand(-0.4, 0.4), y: rand(-0.4, 0.4), z: rand(-0.4, 0.4) },
      true,
    );
  };

  return (
    <RigidBody
      ref={body}
      colliders="cuboid"
      position={position}
      restitution={0.35}
      friction={0.9}
      linearDamping={0.25}
      angularDamping={0.45}
    >
      <RoundedBox
        args={[width, height, depth]}
        radius={0.07}
        smoothness={4}
        onClick={(e) => {
          e.stopPropagation();
          poke();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "grab";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          roughness={0.4}
          metalness={0.1}
        />
      </RoundedBox>
      <Html center distanceFactor={11} style={{ pointerEvents: "none" }}>
        <span className="chip-label">{skill.label}</span>
      </Html>
    </RigidBody>
  );
}

export default function SkillsScene({ apiRef }: SceneProps) {
  // Stable initial drop positions — scattered across the visible bin so the
  // very first frame already looks populated, then physics settles them.
  const positions = useMemo<[number, number, number][]>(
    () => skills.map(() => [rand(-4, 4), rand(0.5, 6), rand(-1.5, 1.5)]),
    [],
  );

  return (
    <Canvas
      flat
      camera={{ position: [0, 1.5, 12], fov: 42 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#060d09"]} />
      <fog attach="fog" args={["#060d09", 14, 26]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[6, 10, 6]} intensity={1.15} />
      <pointLight position={[-6, 3, 5]} color="#33ff33" intensity={26} distance={26} />
      <pointLight position={[6, 2, 5]} color="#ffb000" intensity={16} distance={24} />

      <Physics gravity={[0, -12, 0]}>
        {skills.map((s, i) => (
          <Chip key={s.id} skill={s} position={positions[i]} apiRef={apiRef} />
        ))}

        {/* Invisible bin: floor + four walls keep the chips in frame */}
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[6.5, 0.5, 3]} position={[0, -3, 0]} />
          <CuboidCollider args={[0.5, 6, 3]} position={[-6, 1, 0]} />
          <CuboidCollider args={[0.5, 6, 3]} position={[6, 1, 0]} />
          <CuboidCollider args={[6.5, 6, 0.5]} position={[0, 1, -3]} />
          <CuboidCollider args={[6.5, 6, 0.5]} position={[0, 1, 2.6]} />
        </RigidBody>

        {/* Visible grid floor */}
        <mesh position={[0, -2.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[13, 6]} />
          <meshStandardMaterial color="#0c1a0c" roughness={0.9} metalness={0} />
        </mesh>
        <gridHelper
          args={[13, 26, "#33ff33", "#15401a"]}
          position={[0, -2.49, 0]}
        />
      </Physics>
    </Canvas>
  );
}
