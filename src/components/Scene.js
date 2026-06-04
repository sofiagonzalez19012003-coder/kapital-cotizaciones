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
    return 5 - (scrollProgress * 12.5);
  }, [phase, currentQ, scrollProgress]);

  useFrame((state) => {
    const targetX = (state.mouse.x * 0.7);
    const targetY = (state.mouse.y * 0.4);

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.05);

    state.camera.lookAt(0, 0, -6);
  });

  return null;
}

function AudioCore() {
  const outerRing = useRef();
  const middleRing = useRef();
  const innerRing = useRef();
  const coreNode = useRef();
  const scrollProgress = useFormStore(state => state.scrollProgress);
  const phase = useFormStore(state => state.phase);

  const separation = useMemo(() => {
    if (phase !== 'landing') return 0;
    return Math.max(0, Math.min(1.5, (scrollProgress - 0.2) * 3));
  }, [scrollProgress, phase]);

  const speed = useMemo(() => {
    if (phase !== 'landing') return 1;
    return 1 + (scrollProgress * 3.5);
  }, [scrollProgress, phase]);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (outerRing.current) {
      outerRing.current.rotation.x = elapsed * 0.25 * speed;
      outerRing.current.rotation.y = elapsed * 0.1 * speed;
      outerRing.current.position.z = -6 + separation;
    }
    if (middleRing.current) {
      middleRing.current.rotation.y = elapsed * 0.3 * speed;
      middleRing.current.rotation.z = elapsed * 0.15 * speed;
      middleRing.current.position.z = -6;
    }
    if (innerRing.current) {
      innerRing.current.rotation.x = elapsed * 0.15 * speed;
      innerRing.current.rotation.z = elapsed * 0.35 * speed;
      innerRing.current.position.z = -6 - separation;
    }
    if (coreNode.current) {
      // Core pulsing glow scaling
      const pulse = Math.sin(elapsed * 4) * 0.08 + 1.0;
      coreNode.current.scale.set(pulse, pulse, pulse);
      coreNode.current.rotation.y = -elapsed * 0.5 * speed;
    }
  });

  return (
    <group>
      {/* Central Pulsing Glowing Node */}
      <mesh ref={coreNode} position={[0, 0, -6]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0033" 
          emissiveIntensity={2.5} 
          roughness={0.1}
          metalness={0.9}
          wireframe
        />
      </mesh>

      {/* Outer Torus Ring - PBR Material */}
      <mesh ref={outerRing}>
        <torusGeometry args={[2.0, 0.04, 12, 64]} />
        <meshStandardMaterial 
          color="#C0392B" 
          emissive="#590707" 
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.9}
          wireframe
        />
      </mesh>
      
      {/* Middle Torus Ring - PBR Material */}
      <mesh ref={middleRing}>
        <torusGeometry args={[1.5, 0.03, 10, 56]} />
        <meshStandardMaterial 
          color="#8a0c0c" 
          emissive="#400303" 
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.95}
          wireframe
        />
      </mesh>

      {/* Inner Torus Ring - PBR Material */}
      <mesh ref={innerRing}>
        <torusGeometry args={[1.0, 0.025, 8, 48]} />
        <meshStandardMaterial 
          color="#ff3333" 
          emissive="#C0392B" 
          emissiveIntensity={1.2}
          roughness={0.15}
          metalness={0.9}
          wireframe
        />
      </mesh>
    </group>
  );
}

function EcosystemSatellites() {
  const scrollProgress = useFormStore(state => state.scrollProgress);
  const phase = useFormStore(state => state.phase);

  const satellites = [
    { name: "Studio", angle: 0 },
    { name: "Legal", angle: 60 },
    { name: "Marketing", angle: 120 },
    { name: "Digital", angle: 180 },
    { name: "Management", angle: 240 },
    { name: "Sync", angle: 300 },
  ];

  const { radius, opacity } = useMemo(() => {
    if (phase !== 'landing') return { radius: 0, opacity: 0 };
    const expandProgress = Math.max(0, Math.min(1, (scrollProgress - 0.35) / 0.25));
    const r = expandProgress * 3.4;
    let op = expandProgress;
    if (scrollProgress > 0.72) {
      const fadeProgress = Math.max(0, Math.min(1, (scrollProgress - 0.72) / 0.12));
      op = 1 - fadeProgress;
    }
    return { radius: r, opacity: op * 0.85 };
  }, [scrollProgress, phase]);

  if (opacity <= 0.01) return null;

  return (
    <group position={[0, 0, -6]}>
      {satellites.map((sat, i) => {
        const rad = (sat.angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;
        
        return (
          <group key={i} position={[x, y, 0]}>
            {/* Satellite Node */}
            <mesh>
              <sphereGeometry args={[0.22, 12, 12]} />
              <meshStandardMaterial 
                color={i % 2 === 0 ? "#ff2222" : "#C0392B"} 
                emissive={i % 2 === 0 ? "#C0392B" : "#590707"}
                emissiveIntensity={1.5}
                roughness={0.1}
                metalness={0.8}
                wireframe
              />
            </mesh>
            {/* Connection ring orbit indicator */}
            <mesh rotation={[Math.PI/2, 0, 0]}>
              <torusGeometry args={[0.35, 0.005, 4, 24]} />
              <meshBasicMaterial 
                color="#C0392B" 
                transparent 
                opacity={opacity * 0.5} 
                wireframe 
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function GridFloor() {
  const gridRef = useRef();
  const scrollProgress = useFormStore(state => state.scrollProgress);

  useFrame((state) => {
    if (gridRef.current) {
      const multiplier = 1.6 + (scrollProgress * 4.5);
      gridRef.current.position.z = (state.clock.getElapsedTime() * multiplier) % 2;
    }
  });

  return (
    <group ref={gridRef}>
      <gridHelper args={[50, 24, '#C0392B', '#3b0303']} position={[0, -2.6, -20]} />
      <gridHelper args={[50, 24, '#C0392B', '#3b0303']} position={[0, -2.6, 0]} />
    </group>
  );
}

function WireframeSphere() {
  const sphereRef = useRef();
  
  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <mesh ref={sphereRef} position={[0, 0, -12]}>
      <sphereGeometry args={[3.2, 32, 32]} />
      <meshBasicMaterial color="#590707" wireframe transparent opacity={0.06} />
    </mesh>
  );
}

function DustNebula() {
  const count = 750;
  const particlesRef = useRef();

  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Create a spiral galaxy / nebula distribution
      const r = Math.random() * 15 + 2;
      const theta = Math.random() * Math.PI * 2 + (r * 0.15); // spiral pitch
      p[i * 3] = Math.cos(theta) * r;
      p[i * 3 + 1] = (Math.random() - 0.5) * 6; // thickness
      p[i * 3 + 2] = Math.sin(theta) * r - 6; // offset center to match core
    }
    return p;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      // Stellar dust slowly rotating around the core
      particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.04;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[points, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ff3333"
        transparent
        opacity={0.4}
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
        <fog attach="fog" args={['#050505', 2, 15]} />
        <ambientLight intensity={0.2} />
        
        {/* Dynamic Studio lights for realistic PBR metal reflections */}
        <directionalLight position={[2, 4, 3]} intensity={1.2} color="#ff3333" />
        <directionalLight position={[-2, -2, 2]} intensity={0.5} color="#590707" />
        <pointLight position={[-3, 2, -1]} intensity={3} color="#C0392B" />
        <pointLight position={[3, -2, -6]} intensity={2.5} color="#ff0000" />
        
        <DustNebula />
        <AudioCore />
        <EcosystemSatellites />
        <GridFloor />
        <WireframeSphere />
        <CameraRig />
      </Canvas>
    </div>
  );
}
