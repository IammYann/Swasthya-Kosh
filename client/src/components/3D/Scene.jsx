import { Canvas } from '@react-three/fiber';
import { Particles } from './Particles';
import { MountainShape } from './MountainShape';
import { Environment, Preload } from '@react-three/drei';
import { Suspense } from 'react';

export function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 50], fov: 75 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Suspense fallback={null}>
        <Environment preset="night" />
        <Particles />
        <MountainShape />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
