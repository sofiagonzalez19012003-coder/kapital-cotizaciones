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

  const numRows = 3;
  const numBarsPerRow = 16;
  const pointsPerBar = 24;
  const count = numRows * numBarsPerRow * pointsPerBar;

  // Generate equalizer bar points and vertex colors
  const [positions, colors, rowIndices, barIndices, pointIndices] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const rowInd = new Float32Array(count);
    const barInd = new Float32Array(count);
    const pointInd = new Float32Array(count);

    let idx = 0;
    for (let r = 0; r < numRows; r++) {
      // Row Z depth
      const z = -8.0 + r * 2.0;

      for (let b = 0; b < numBarsPerRow; b++) {
        // Bar X position
        const x = -7.5 + b * 1.0;

        for (let v = 0; v < pointsPerBar; v++) {
          // Vertical Y height
          const y = -2.4 + (v / (pointsPerBar - 1)) * 4.8;

          pos[idx * 3] = x;
          pos[idx * 3 + 1] = y;
          pos[idx * 3 + 2] = z;

          // Color based on height ratio (equalizer style)
          const ratio = v / (pointsPerBar - 1);
          let c;
          if (ratio < 0.3) {
            c = new THREE.Color("#590707"); // Bottom: Dark Vino
          } else if (ratio < 0.65) {
            c = new THREE.Color("#C0392B"); // Mid: Crimson
          } else if (ratio < 0.88) {
            c = new THREE.Color("#E74C3C"); // Upper: Bright Red
          } else {
            c = new THREE.Color("#ff8080"); // Top: Neon Coral
          }

          cols[idx * 3] = c.r;
          cols[idx * 3 + 1] = c.g;
          cols[idx * 3 + 2] = c.b;

          rowInd[idx] = r;
          barInd[idx] = b;
          pointInd[idx] = v;
          idx++;
        }
      }
    }
    return [pos, cols, rowInd, barInd, pointInd];
  }, [count, numRows, numBarsPerRow, pointsPerBar]);

  const posAttrRef = useRef();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (!posAttrRef.current) return;
    const arr = posAttrRef.current.array;

    // Reacting to user scrolling by speeding up and scaling amplitude
    const scrollFactor = 1.0 + scrollProgress * 2.5;

    for (let i = 0; i < count; i++) {
      const r = rowIndices[i];
      const b = barIndices[i];
      const v = pointIndices[i];

      // Bounce level based on row, bar, and time
      const speed = 4.0 + r * 1.5;
      const val = Math.sin(b * 0.55 + elapsed * speed * scrollFactor) * 0.35 + 
                  Math.cos(b * 1.2 - elapsed * (speed * 0.55) + r * 0.7) * 0.25 + 
                  Math.sin(elapsed * 9.0 + b * 0.3) * 0.1 + 0.5;

      // Clamp between 0.08 and 1.0
      const level = Math.max(0.08, Math.min(1.0, val));

      // Stretch vertically from the bottom baseline
      // Baseline is Y = -2.4. Height of bar is 4.8.
      const yBaseRatio = v / (pointsPerBar - 1);
      arr[i * 3 + 1] = -2.4 + yBaseRatio * 4.8 * level;
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
        size={0.16}
        vertexColors
        transparent
        opacity={0.68}
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
