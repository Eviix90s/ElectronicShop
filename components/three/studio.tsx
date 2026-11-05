"use client";

/**
 * Escena de estudio compartida (port de `studioEnv` + `makeScene` del prototipo):
 * entorno de 4 paneles emisivos en una sala gris (sin HDR de red), luz clave con
 * sombra suave, relleno cálido, suelo con ShadowMaterial y mancha de AO.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { Environment } from "@react-three/drei";
import { blobTexture } from "./models";

/** Sala + paneles del prototipo, como grupo Three.js para renderizar al cubemap */
function makeStudioRoom(): THREE.Group {
  const room = new THREE.Group();
  room.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(24, 24, 24),
      new THREE.MeshStandardMaterial({ color: 0x6a6a6a, side: THREE.BackSide, roughness: 1, metalness: 0 }),
    ),
  );
  const panel = (w: number, h: number, x: number, y: number, z: number, rx: number, ry: number, k: number) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }),
    );
    m.position.set(x, y, z);
    m.rotation.set(rx, ry, 0);
    room.add(m);
  };
  panel(12, 7, 0, 10.5, 1, Math.PI / 2, 0, 7);
  panel(7, 9, -11, 3, 2, 0, Math.PI / 2, 4);
  panel(7, 9, 11, 4, -2, 0, -Math.PI / 2, 2.4);
  panel(14, 3, 0, 3, -11, 0, 0, 1.8);
  panel(10, 2, 0, -2, 11, 0, Math.PI, 0.8);
  return room;
}

interface StudioEnvironmentProps {
  /** `scene.environmentIntensity`; el prototipo usa 0.9 */
  intensity?: number;
}

/**
 * Entorno PBR generado en GPU a partir de la sala de paneles (un solo fotograma,
 * cubemap de 256 px). No descarga ningún HDR.
 */
export function StudioEnvironment({ intensity = 0.9 }: StudioEnvironmentProps) {
  const room = useMemo(() => makeStudioRoom(), []);
  // Elemento memoizado: drei vuelve a capturar el cubemap cuando cambia `children`.
  const content = useMemo(() => <primitive object={room} dispose={null} />, [room]);
  return (
    <Environment resolution={256} frames={1} near={0.1} far={100} environmentIntensity={intensity}>
      {content}
    </Environment>
  );
}

/** Luz clave (sombra suave 2048) + relleno cálido, como en el prototipo */
export function StudioLights() {
  return (
    <>
      <directionalLight
        position={[3, 7, 4]}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0003}
        shadow-normalBias={0.02}
        shadow-radius={6}
      >
        <orthographicCamera attach="shadow-camera" args={[-3.5, 3.5, 3.5, -3.5, 0.5, 20]} />
      </directionalLight>
      <directionalLight color={0xfff3e4} intensity={0.55} position={[-5, 3, -2]} />
    </>
  );
}

interface GroundShadowProps {
  /** y mínima del modelo centrado; el suelo se apoya justo debajo */
  bottomY: number;
  /** Huella [x, z] del modelo; la mancha de AO se escala ×1.5 */
  footprint?: [number, number];
  /** Alternativa a `footprint`: mancha cuadrada de 2·radius */
  radius?: number;
  /** Opacidad de la sombra proyectada (0.2 en tema claro) */
  shadowOpacity?: number;
}

/** Plano receptor de sombras (ShadowMaterial) + mancha radial de AO bajo el modelo */
export function GroundShadow({ bottomY, footprint, radius = 1, shadowOpacity = 0.2 }: GroundShadowProps) {
  const blob = useMemo(() => blobTexture(), []);
  const [fx, fz] = footprint ?? [radius * 2, radius * 2];
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={bottomY - 0.01} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <shadowMaterial opacity={shadowOpacity} />
      </mesh>
      {blob && (
        <mesh rotation-x={-Math.PI / 2} position-y={bottomY - 0.004} scale={[fx * 1.5, fz * 1.5, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={blob} transparent depthWrite={false} />
        </mesh>
      )}
    </>
  );
}
