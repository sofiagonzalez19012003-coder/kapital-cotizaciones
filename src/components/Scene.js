import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useFormStore } from '../store/useFormStore';

function CameraRig() {
  const scrollProgress = useFormStore(state => state.scrollProgress);
  const phase = useFormStore(state => state.phase);
  const currentQ = useFormStore(state => state.currentQ);

  const targetZ = useMemo(() => {
    if (phase !== 'landing') {
      if (phase === 'form') return 5 - (currentQ * 0.45);
      if (phase === 'extras') return 2.2;
      if (phase === 'loading') return 0;
      if (phase === 'proposal') return -1.8;
      return 5;
    }
    // Apple-style Z zoom-through based on landing scroll progress
    // Zooms through the central core at Z=-6
    return 5 - (scrollProgress * 12.0);
  }, [phase, currentQ, scrollProgress]);

  useFrame((state) => {
    const targetX = (state.mouse.x * 0.5);
    const targetY = (state.mouse.y * 0.3);

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);

    state.camera.lookAt(0, 0, -6);
  });

  return null;
}

function SoundWaves() {
  const pointsRef = useRef();
  const scrollProgress = useFormStore(state => state.scrollProgress);

  const numLines = 5;
  const pointsPerLine = 100;
  const count = numLines * pointsPerLine;

  // Generate wave line points and vertex colors
  const [positions, colors, initialX, lineIndices] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const initX = new Float32Array(count);
    const lineInd = new Float32Array(count);

    const baseColors = [
      new THREE.Color("#C0392B"), // Rojo Kapital
      new THREE.Color("#E74C3C"), // Rojo Brillante
      new THREE.Color("#e63333"), // Rojo Neón
      new THREE.Color("#8a0c0c"), // Vino Tinto Oscuro
      new THREE.Color("#ff8080"), // Coral Claro
    ];

    let idx = 0;
    for (let l = 0; l < numLines; l++) {
      const z = -6.5 + (l - (numLines - 1) / 2) * 1.5;
      const c = baseColors[l % baseColors.length];

      for (let p = 0; p < pointsPerLine; p++) {
        const x = -8 + (p / (pointsPerLine - 1)) * 16;
        
        pos[idx * 3] = x;
        pos[idx * 3 + 1] = 0;
        pos[idx * 3 + 2] = z;

        cols[idx * 3] = c.r;
        cols[idx * 3 + 1] = c.g;
        cols[idx * 3 + 2] = c.b;

        initX[idx] = x;
        lineInd[idx] = l;
        idx++;
      }
    }
    return [pos, cols, initX, lineInd];
  }, [count, numLines, pointsPerLine]);

  const posAttrRef = useRef();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (!posAttrRef.current) return;
    const arr = posAttrRef.current.array;

    // Reacting to user scrolling by changing speed and amplitude
    const scrollFactor = 1.0 + scrollProgress * 3.5;

    for (let i = 0; i < count; i++) {
      const x = initialX[i];
      const l = lineIndices[i];

      // Simulated sound waves frequencies:
      // Bass beats
      const bass = Math.sin(x * 0.45 + elapsed * 3.0 * scrollFactor + l * 0.6) * 0.85;
      // Mid range
      const mid = Math.cos(x * 1.6 - elapsed * 6.5 + l * 1.2) * 0.28;
      // High frequency treble
      const treble = Math.sin(x * 4.2 + elapsed * 15.0) * 0.08;

      // Parabolic boundary mask to pinch the wave at the screen borders
      const envelope = Math.max(0, 1.0 - (x * x) / 64.0);

      arr[i * 3 + 1] = (bass + mid + treble) * envelope * 1.3;
    }
    posAttrRef.current.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          ref={posAttrRef}
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function GridFloor() {
  const gridRef = useRef();
  const scrollProgress = useFormStore(state => state.scrollProgress);

  useFrame((state) => {
    if (gridRef.current) {
      // Extremely slow grid movement to keep the look extremely clean and calm
      const multiplier = 0.02 + (scrollProgress * 0.06);
      gridRef.current.position.z = (state.clock.getElapsedTime() * multiplier) % 2;
    }
  });

  return (
    <group ref={gridRef}>
      {/* Low opacity subtle grid helper to avoid visual saturation */}
      <gridHelper args={[40, 20, '#590707', '#111111']} position={[0, -2.6, -20]} />
      <gridHelper args={[40, 20, '#590707', '#111111']} position={[0, -2.6, 0]} />
    </group>
  );
}

function AmbientDust() {
  const count = 70; // Highly reduced count to avoid visual clutter

  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 16;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 30 - 5;
    }
    return p;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.016}
        color="#ff8080"
        transparent
        opacity={0.2}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Scene() {
  return (
    <div className="fixed inset-0 w-screen h-screen z-0 bg-[#050505] pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        <fog attach="fog" args={['#050505', 2, 14]} />
        <ambientLight intensity={0.2} />
        
        <directionalLight position={[1, 4, 3]} intensity={1.0} color="#ff3333" />
        <pointLight position={[-3, 2, -1]} intensity={1.5} color="#590707" />
        
        <AmbientDust />
        <SoundWaves />
        <GridFloor />
        <CameraRig />
      </Canvas>
    </div>
  );
}
