import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScroll } from '@react-three/drei';

export function Particles() {
  const particlesRef = useRef(null);
  const scroll = useScroll();

  const particles = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Mountain-like distribution
      const angle = (i / count) * Math.PI * 2;
      const distance = 30 + Math.random() * 20;
      const height = (Math.sin(angle * 3) * 0.5 + 0.5) * 40 - 20;

      positions[i * 3] = Math.cos(angle) * distance;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * distance + Math.random() * 10;

      // Teal to gold gradient
      const hue = 0.5 + Math.random() * 0.1;
      colors[i * 3] = Math.cos(hue) * 0.5 + 0.5; // R
      colors[i * 3 + 1] = Math.sin(hue) * 0.8 + 0.5; // G
      colors[i * 3 + 2] = 0.8; // B
    }

    return { positions, colors };
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
      
      // Scroll interaction
      const scrollProgress = scroll.offset;
      particlesRef.current.scale.lerp(
        new THREE.Vector3(1 + scrollProgress * 0.5, 1 + scrollProgress * 0.5, 1),
        0.1
      );
    }
  });

  return (
    <group ref={particlesRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particles.positions.length / 3}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particles.colors.length / 3}
            array={particles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.8}
        />
      </points>
    </group>
  );
}
