import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function MountainShape() {
  const mountainRef = useRef(null);

  useFrame(() => {
    if (mountainRef.current) {
      mountainRef.current.rotation.y += 0.0005;
      mountainRef.current.position.y = Math.sin(Date.now() * 0.0002) * 2;
    }
  });

  return (
    <group ref={mountainRef}>
      <mesh position={[0, -10, -30]}>
        <coneGeometry args={[15, 30, 32]} />
        <meshStandardMaterial
          color="#00D4B4"
          emissive="#00D4B4"
          emissiveIntensity={0.3}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Additional peaks */}
      <mesh position={[-20, -5, -35]}>
        <coneGeometry args={[8, 20, 24]} />
        <meshStandardMaterial
          color="#F5A623"
          emissive="#F5A623"
          emissiveIntensity={0.2}
          metalness={0.5}
          roughness={0.5}
        />
      </mesh>

      <mesh position={[20, -8, -32]}>
        <coneGeometry args={[10, 25, 28]} />
        <meshStandardMaterial
          color="#00D4B4"
          emissive="#00D4B4"
          emissiveIntensity={0.25}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
    </group>
  );
}
