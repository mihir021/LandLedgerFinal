import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sparkles, OrbitControls, Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const GLB_MODEL_PATH = '/models/land_parcel.glb';

// Preload GLB model
useGLTF.preload(GLB_MODEL_PATH);

// ── 3D GLB Hexagon Land Model Component ──
function GLBModelInstance() {
  const { scene } = useGLTF(GLB_MODEL_PATH);

  // Normalize, center, and scale GLB model to fill scene cleanly
  const normalizedWrapper = useMemo(() => {
    const cloned = scene.clone(true);

    // Ensure all meshes are visible and render with original PBR materials
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.visible = true;
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.side = THREE.DoubleSide;
        }
      }
    });

    // Calculate exact bounding box & center
    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    // Scale model to fill 3D hero area (~5.2 units wide)
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = maxDim > 0 ? 5.2 / maxDim : 1.0;

    const wrapper = new THREE.Group();
    cloned.position.set(-center.x * targetScale, -center.y * targetScale, -center.z * targetScale);
    cloned.scale.set(targetScale, targetScale, targetScale);
    wrapper.add(cloned);

    return wrapper;
  }, [scene]);

  return <primitive object={normalizedWrapper} position={[0, -0.2, 0]} />;
}

// ── Main HeroLandParcel Canvas Component ──
export default function HeroLandParcel() {
  return (
    <div className="relative w-full h-[480px] sm:h-[520px] lg:h-[580px] flex items-center justify-center cursor-grab active:cursor-grabbing">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-amber-400/10 to-transparent rounded-full blur-3xl pointer-events-none transform scale-95" />
      
      <Canvas
        camera={{ position: [0, 2.5, 6.0], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        className="w-full h-full"
      >
        {/* Scene Lighting tuned for GLB model details */}
        <ambientLight intensity={1.8} color="#ffffff" />
        <directionalLight position={[6, 12, 6]} color="#ffffff" intensity={2.2} />
        <directionalLight position={[-6, -4, -4]} color="#3b82f6" intensity={0.6} />
        <pointLight position={[-4, 5, 4]} color="#fde047" intensity={4} distance={16} />
        <pointLight position={[4, 5, -4]} color="#60a5fa" intensity={2.5} distance={14} />

        {/* 360° Mouse Drag Orbit Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.8}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.1}
        />

        {/* Gentle Floating Motion */}
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.35}>
          <group>
            {/* GLB Model Only */}
            <Suspense fallback={null}>
              <GLBModelInstance />
            </Suspense>

            {/* Subtle Gold Dust Sparkles */}
            <Sparkles
              count={40}
              scale={[6, 5, 6]}
              size={2.2}
              speed={0.05}
              color="#d4af37"
              opacity={0.55}
            />
          </group>
        </Float>
      </Canvas>
    </div>
  );
}
