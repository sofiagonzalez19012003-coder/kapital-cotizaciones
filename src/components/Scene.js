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

function HolographicVinyl() {
  const vinylRef = useRef();
  const scrollProgress = useFormStore(state => state.scrollProgress);
  const phase = useFormStore(state => state.phase);

  const groovesMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#C0392B",
      emissive: "#C0392B",
      emissiveIntensity: 1.2,
      roughness: 0.1,
      metalness: 0.95
    });
  }, []);

  const tilt = useMemo(() => {
    if (phase !== 'landing') return 0.5; // Default tilt
    // Tilts slightly more as the user scrolls
    return 0.5 + (scrollProgress * 0.4);
  }, [scrollProgress, phase]);

  const speed = useMemo(() => {
    if (phase !== 'landing') return 0.12;
    return 0.12 + (scrollProgress * 0.35);
  }, [scrollProgress, phase]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (vinylRef.current) {
      // Platters rotation around Y-axis
      vinylRef.current.rotation.y = elapsed * speed;
      // Tilt transition based on scroll
      vinylRef.current.rotation.x = THREE.MathUtils.lerp(vinylRef.current.rotation.x, tilt, 0.05);
      
      // Simulated audio waveform: bass beats + mid vibration + treble ripples
      const bass = Math.sin(elapsed * 6.5) * 0.035;
      const mid = Math.cos(elapsed * 16.0) * 0.009;
      const treble = Math.sin(elapsed * 32.0) * 0.003;
      const pulse = 1.0 + bass + mid + treble;
      
      // Scale pulse representation of sound energy
      vinylRef.current.scale.set(pulse, pulse, pulse);

      // Piston-like speaker vibration along the Y-axis (bobbing)
      const vibration = Math.sin(elapsed * 6.5) * 0.05 + Math.cos(elapsed * 13.0) * 0.015;
      vinylRef.current.position.y = vibration;

      // Glow pulse on grooves simulating soundwave dynamic ranges
      if (groovesMaterial) {
        const beat = Math.sin(elapsed * 6.5) * 0.7 + Math.cos(elapsed * 16.0) * 0.35;
        groovesMaterial.emissiveIntensity = Math.max(0.5, 1.2 + beat);
      }
    }
  });

  return (
    <group ref={vinylRef} position={[0, 0, -6]}>
      {/* Vinyl Outer Platter (Concentric ridges styled cylinder) */}
      <mesh>
        <cylinderGeometry args={[2.2, 2.2, 0.05, 64]} />
        <meshStandardMaterial 
          color="#111111" 
          roughness={0.25}
          metalness={0.9}
        />
      </mesh>

      {/* Glossy grooves grooves representation (Thin torus layers) */}
      {[1.9, 1.6, 1.3, 1.0].map((r, i) => (
        <mesh 
          key={i} 
          position={[0, 0.026, 0]} 
          rotation={[Math.PI / 2, 0, 0]}
          material={groovesMaterial}
        >
          <torusGeometry args={[r, 0.006, 4, 64]} />
        </mesh>
      ))}

      {/* Red Center Label */}
      <mesh position={[0, 0.028, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.005, 32]} />
        <meshBasicMaterial color="#C0392B" />
      </mesh>

      {/* Center Label decorative rings */}
      <mesh position={[0, 0.031, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.004, 4, 32]} />
        <meshBasicMaterial color="#111111" />
      </mesh>

      {/* Spindle Center Pin (Metallic silver) */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 16]} />
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>
    </group>
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
        <HolographicVinyl />
        <GridFloor />
        <CameraRig />
      </Canvas>
    </div>
  );
}
