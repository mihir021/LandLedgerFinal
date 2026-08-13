import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileCheck, Swords } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// Cursor movement is deliberately constrained so the figure always remains front-facing.
function FrontFacingCursorMotion({ cursorRef, children }) {
  const groupRef = useRef();

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = cursorRef.current;
    groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, target.x * 0.28, 13, delta);
    groupRef.current.rotation.x = THREE.MathUtils.damp(groupRef.current.rotation.x, -target.y * 0.10, 13, delta);
  });

  return <group ref={groupRef}>{children}</group>;
}

/**
 * 3D Spiderman Model Component
 */
function Spiderman3DModel({ cursorRef }) {
  const { scene } = useGLTF('/lego_spiderman.glb');
  
  // Clone and normalize the model
  const cloneData = useMemo(() => {
    const clonedScene = scene.clone();
    // Spiderman is already upright, but we need to rotate it so it faces slightly 3/4 front right
    clonedScene.rotation.set(0, -Math.PI / 8, 0);
    clonedScene.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Fit into a reasonable scale
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 4.5 / maxDim; // slightly larger to fill frame
    
    return { scene: clonedScene, scale, center };
  }, [scene]);

  return (
    <FrontFacingCursorMotion cursorRef={cursorRef}>
      <group scale={cloneData.scale} position={[-cloneData.center.x * cloneData.scale, -cloneData.center.y * cloneData.scale, -cloneData.center.z * cloneData.scale]}>
        <primitive object={cloneData.scene} />
      </group>
    </FrontFacingCursorMotion>
  );
}

/**
 * 3D Lego Guy Model Component
 */
function LegoGuy3DModel({ cursorRef }) {
  const { scene } = useGLTF('/lego_guy.glb');
  
  // Clone and normalize the model
  const cloneData = useMemo(() => {
    const clonedScene = scene.clone();
    
    // The GLB exports with its back toward the default R3F camera. Turn it once
    // around its vertical axis so the face and torso are presented to the user.
    const wrapper = new THREE.Group();
    wrapper.rotation.set(0, Math.PI, 0);
    wrapper.add(clonedScene);
    
    wrapper.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(wrapper);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Fit into a reasonable scale
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 4.5 / maxDim; // slightly larger to fill frame
    
    return { scene: wrapper, scale, center };
  }, [scene]);

  return (
    <FrontFacingCursorMotion cursorRef={cursorRef}>
      <group scale={cloneData.scale} position={[-cloneData.center.x * cloneData.scale, -cloneData.center.y * cloneData.scale, -cloneData.center.z * cloneData.scale]}>
        <primitive object={cloneData.scene} />
      </group>
    </FrontFacingCursorMotion>
  );
}

// Preload the models
useGLTF.preload('/lego_spiderman.glb');
useGLTF.preload('/lego_guy.glb');

/**
 * Floating 3D LEGO Minifigure Warrior Sculpture (Left Side)
 */
export function LegoVisualLeft({ activeModel = 'spiderman' }) {
  const containerRef = useRef(null);
  const cursorRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef(null);
  const pendingCursorRef = useRef(null);

  useEffect(() => () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  }, []);

  const handleMouseMove = (event) => {
    if (!containerRef.current || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    pendingCursorRef.current = { clientX: event.clientX, clientY: event.clientY };
    if (animationFrameRef.current) return;

    animationFrameRef.current = requestAnimationFrame(() => {
      const pointer = pendingCursorRef.current;
      const rect = containerRef.current?.getBoundingClientRect();
      animationFrameRef.current = null;
      if (!pointer || !rect) return;

      cursorRef.current.x = THREE.MathUtils.clamp(((pointer.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      cursorRef.current.y = THREE.MathUtils.clamp(((pointer.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    });
  };

  const handleMouseLeave = () => {
    cursorRef.current.x = 0;
    cursorRef.current.y = 0;
  };

  return (
    <div className="hidden lg:flex flex-col items-center justify-center pointer-events-none z-0">
      <motion.div
        animate={{
          y: [0, -14, 0],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative flex flex-col items-center justify-center p-2"
      >
        {/* Floating Header Tag */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-3 inline-flex items-center gap-1.5 rounded-sm bg-[#0A1628] border-2 border-amber-400 px-3 py-1 shadow-[3px_3px_0px_#060D17]"
        >
          <Swords className="h-3.5 w-3.5 text-amber-400" />
          <span className="font-pixel text-[11px] font-bold text-amber-300 uppercase tracking-wider">
            REGISTRY GUARDIAN
          </span>
        </motion.div>

        {/* 3D LEGO Minifigure Canvas Container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-64 h-80 xl:w-80 xl:h-96 flex flex-col items-center group pointer-events-auto cursor-default"
        >
          <Canvas
            camera={{ position: [0, 0, 6], fov: 45 }}
            className="w-full h-full rounded-sm filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.35)]"
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
            <directionalLight position={[-5, 5, -5]} intensity={0.8} />
            <Environment preset="city" />
            
            {activeModel === 'spiderman' ? <Spiderman3DModel cursorRef={cursorRef} /> : <LegoGuy3DModel cursorRef={cursorRef} />}
            
            <ContactShadows
              position={[0, -2.5, 0]}
              opacity={0.4}
              scale={10}
              blur={2}
              far={4}
            />
          </Canvas>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Floating 3D LEGO House / Deed Block (Right Side)
 */
export function LegoVisualRight() {
  return (
    <div className="hidden lg:flex flex-col items-center justify-center absolute right-6 xl:right-14 top-1/2 -translate-y-1/2 pointer-events-none z-0">
      <motion.div
        animate={{
          y: [0, 15, 0],
          rotateY: [12, -12, 12],
          rotateX: [-6, 6, -6],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative flex flex-col items-center justify-center p-6"
        style={{ perspective: 1000 }}
      >
        {/* Floating Header Tag */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-4 inline-flex items-center gap-1.5 rounded-sm bg-amber-400 border-2 border-[#475569] px-3 py-1 shadow-[3px_3px_0px_#475569]"
        >
          <FileCheck className="h-3.5 w-3.5 text-[#0A1628]" />
          <span className="font-pixel text-[11px] font-bold text-[#0A1628] uppercase tracking-wider">
            SMART DEED ACTIVE
          </span>
        </motion.div>

        {/* 3D LEGO House / Deed Module */}
        <div className="relative w-40 sm:w-44 flex flex-col items-center">
          {/* Triangular Roof Roof Block */}
          <div className="w-0 h-0 border-l-[45px] border-l-transparent border-r-[45px] border-r-transparent border-b-[30px] border-b-amber-500 filter drop-shadow-[2px_2px_0px_#475569] mb-[-2px] relative z-10" />

          {/* House Roof Studs */}
          <div className="flex gap-2 mb-1 relative z-20">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 border border-[#475569] shadow-inner"
              />
            ))}
          </div>

          {/* Main House Body — Navy Brick */}
          <div className="w-full h-20 rounded-sm bg-[#0A1628] border-2 border-amber-400/80 shadow-[5px_5px_0px_#475569] p-2.5 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              {/* Left Window */}
              <div className="w-5 h-5 rounded-sm bg-amber-400/30 border border-amber-400/70 flex items-center justify-center">
                <div className="w-2 h-2 bg-amber-300" />
              </div>
              <span className="font-pixel text-[9px] text-amber-400 font-bold uppercase tracking-widest">
                IMMUTABLE
              </span>
              {/* Right Window */}
              <div className="w-5 h-5 rounded-sm bg-amber-400/30 border border-amber-400/70 flex items-center justify-center">
                <div className="w-2 h-2 bg-amber-300" />
              </div>
            </div>

            {/* House Door */}
            <div className="flex justify-center">
              <div className="w-6 h-8 rounded-t-sm bg-amber-500 border-2 border-amber-300 flex items-end justify-end p-0.5">
                <div className="w-1 h-1 rounded-full bg-[#0A1628]" />
              </div>
            </div>
          </div>
        </div>

        {/* Shadow Plate underneath */}
        <div className="w-36 h-3 bg-black/15 rounded-full blur-sm mt-4 transform scale-y-50" />
      </motion.div>
    </div>
  );
}
