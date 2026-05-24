"use client";

/**
 * Inspired by Aceternity's CanvasRevealEffect.
 * Reworked to fit the brutalist-glass palette: ink dots on concrete,
 * sparse acid-yellow accents, and a cursor-reactive halo.
 */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

const FRAGMENT = `
precision mediump float;
in vec2 fragCoord;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_total_size;
uniform float u_dot_size;
uniform vec3 u_color_base;
uniform vec3 u_color_accent;
uniform float u_animation_speed;

out vec4 fragColor;

float random(vec2 xy) {
  return fract(sin(dot(xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 st = fragCoord;
  st.x -= mod(u_resolution.x, u_total_size) * 0.5;
  st.y -= mod(u_resolution.y, u_total_size) * 0.5;

  vec2 cellId = floor(st / u_total_size);
  vec2 cellLocal = fract(st / u_total_size) - 0.5;
  vec2 cellCenter = cellId * u_total_size + u_total_size * 0.5;

  float rndSlot = random(cellId);
  float pulsePhase = random(cellId + 0.31);
  float colorRoll = random(cellId + 0.59);

  // Slow per-cell breathing
  float pulse = 0.5 + 0.5 * sin(u_time * u_animation_speed + pulsePhase * 6.2831);

  // Most cells are dim; some breathe between dim and bright
  float baseOpacity = mix(0.05, 0.45, pulse) * step(0.6, rndSlot);

  // Cursor halo
  float mouseDist = distance(cellCenter, u_mouse);
  float mouseRadius = u_total_size * 8.0;
  float mouseInfluence = smoothstep(mouseRadius, 0.0, mouseDist);

  float opacity = baseOpacity + mouseInfluence * 0.9;

  // Round dot mask with anti-alias
  float radius = (u_dot_size / u_total_size) * 0.5;
  float dist = length(cellLocal);
  float aa = 0.015;
  float dotMask = 1.0 - smoothstep(radius - aa, radius + aa, dist);
  opacity *= dotMask;

  // Color: acid when randomly selected OR strong cursor influence
  float acidMix = clamp(step(0.93, colorRoll) + mouseInfluence * 0.85, 0.0, 1.0);
  vec3 color = mix(u_color_base, u_color_accent, acidMix);

  fragColor = vec4(color, opacity);
  fragColor.rgb *= fragColor.a;
}
`;

const VERTEX = `
precision mediump float;
uniform vec2 u_resolution;
out vec2 fragCoord;
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
  fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
  fragCoord.y = u_resolution.y - fragCoord.y;
}
`;

interface ShaderProps {
  totalSize?: number;
  dotSize?: number;
  baseColor?: [number, number, number];
  accentColor?: [number, number, number];
  animationSpeed?: number;
}

function ShaderQuad({
  totalSize = 14,
  dotSize = 2.6,
  baseColor = [20, 20, 20],
  accentColor = [228, 255, 58],
  animationSpeed = 0.7,
}: ShaderProps) {
  const ref = useRef<THREE.Mesh>(null);
  const { size, pointer, gl } = useThree();

  const material = useMemo(() => {
    const dpr = gl.getPixelRatio();
    return new THREE.ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      glslVersion: THREE.GLSL3,
      transparent: true,
      blending: THREE.CustomBlending,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneFactor,
      uniforms: {
        u_time: { value: 0 },
        u_resolution: {
          value: new THREE.Vector2(size.width * dpr, size.height * dpr),
        },
        u_mouse: { value: new THREE.Vector2(-9999, -9999) },
        u_total_size: { value: totalSize * dpr },
        u_dot_size: { value: dotSize * dpr },
        u_color_base: {
          value: new THREE.Vector3(
            baseColor[0] / 255,
            baseColor[1] / 255,
            baseColor[2] / 255
          ),
        },
        u_color_accent: {
          value: new THREE.Vector3(
            accentColor[0] / 255,
            accentColor[1] / 255,
            accentColor[2] / 255
          ),
        },
        u_animation_speed: { value: animationSpeed },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    size.width,
    size.height,
    totalSize,
    dotSize,
    baseColor,
    accentColor,
    animationSpeed,
  ]);

  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.ShaderMaterial;
    mat.uniforms.u_time.value = state.clock.getElapsedTime();
    const dpr = gl.getPixelRatio();
    const mx = (pointer.x * 0.5 + 0.5) * size.width * dpr;
    const my = (1 - (pointer.y * 0.5 + 0.5)) * size.height * dpr;
    const cur = mat.uniforms.u_mouse.value as THREE.Vector2;
    cur.x += (mx - cur.x) * 0.18;
    cur.y += (my - cur.y) * 0.18;
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function DotMatrixReveal(props: ShaderProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: false }}
      orthographic
      className="!absolute inset-0"
    >
      <Suspense fallback={null}>
        <ShaderQuad {...props} />
      </Suspense>
    </Canvas>
  );
}

export default DotMatrixReveal;
