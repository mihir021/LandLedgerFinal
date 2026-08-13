/**
 * LegoSpaceDartHighway — LEGO Space Dart runway, fixed top-down view
 */
import React, { useRef, useMemo, useEffect, Component } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, invalidate } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dartModelUrl from '../assets/models/lego_space_dart_i.glb?url';

gsap.registerPlugin(ScrollTrigger);
useGLTF.preload(dartModelUrl);

// Error boundary to prevent white-box crashes if WebGL is unsupported or model fails
class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null; // Fallback to transparent/empty
    return this.props.children;
  }
}

function LegoPlane({ progressRef, directionRef }) {
  const groupRef    = useRef();
  const flipRef     = useRef();
  const innerRef    = useRef();
  const { scene }   = useGLTF(dartModelUrl);

  const model = useMemo(() => {
    const clone = scene.clone(true);
    const box   = new THREE.Box3();
    clone.traverse(c => { if (c.isMesh) { c.updateMatrixWorld(true); box.expandByObject(c); } });
    if (!box.isEmpty()) {
      const size   = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale  = 3.2 / Math.max(size.x, size.y, size.z, 1);
      clone.scale.setScalar(scale);
      clone.position.set(0, -center.y * scale, -center.z * scale);
    }
    return clone;
  }, [scene]);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !flipRef.current || !innerRef.current) return;
    const raw      = Math.max(0, Math.min(1, progressRef.current));
    const time     = clock.getElapsedTime();
    const takeoffT = Math.max(0, (raw - 0.92) / 0.08);

    // Keep outer group neutral — no rotation here
    groupRef.current.rotation.set(0, 0, 0);

    // Flip direction on Y inside the view-lock group
    // direction = 1 (scrolling down) → nose forward (0)
    // direction = -1 (scrolling up)  → nose backward (π)
    const targetFlipY = directionRef.current === -1 ? Math.PI : 0;
    flipRef.current.rotation.x = Math.PI / 2; // lock top-down view
    flipRef.current.rotation.y = THREE.MathUtils.damp(
      flipRef.current.rotation.y,
      targetFlipY,
      10,
      delta
    );
    flipRef.current.rotation.z = 0;

    const bob  = Math.sin(time * 2.5) * 0.08;
    const bank = Math.sin(time * 1.6) * 0.06;

    if (takeoffT > 0) {
      innerRef.current.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 3, takeoffT);
      innerRef.current.rotation.z = 0;
      innerRef.current.position.z = bob + takeoffT * 4;
      innerRef.current.position.y = takeoffT * 2;
      innerRef.current.scale.setScalar(THREE.MathUtils.lerp(1, 0.05, takeoffT));
    } else {
      innerRef.current.rotation.x = THREE.MathUtils.damp(innerRef.current.rotation.x, bank, 5, delta);
      innerRef.current.rotation.z = 0;
      innerRef.current.position.z = bob;
      innerRef.current.position.y = THREE.MathUtils.damp(innerRef.current.position.y, 0, 6, delta);
      innerRef.current.scale.setScalar(THREE.MathUtils.damp(innerRef.current.scale.x, 1, 6, delta));
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={flipRef}>
        <group ref={innerRef}>
          <primitive object={model} />
        </group>
      </group>
    </group>
  );
}

export default function LegoSpaceDartHighway({ containerRef }) {
  const progressRef      = useRef(0);
  const directionRef     = useRef(1);
  const canvasWrapperRef = useRef();

  useEffect(() => {
    if (!containerRef?.current || !canvasWrapperRef?.current) return;
    const st = ScrollTrigger.create({
      trigger : containerRef.current,
      start   : 'top 60%',
      end     : 'bottom 40%',
      scrub   : 1,
      onUpdate: (self) => {
        progressRef.current  = self.progress;
        directionRef.current = self.direction;
        if (canvasWrapperRef.current) {
          canvasWrapperRef.current.style.top = `${self.progress * 100}%`;
        }
        invalidate();
      },
    });
    return () => st.kill();
  }, [containerRef]);

  return (
    <>
      {/* Runway strip */}
      <div
        className="absolute left-[3px] md:left-1/2 top-0 bottom-0 md:-translate-x-1/2 z-0 pointer-events-none"
        style={{ width: '76px' }}
      >
        <div className="absolute inset-0 bg-[#080F1E] border-x-2 border-amber-400/50 rounded-sm overflow-hidden">
          <div className="absolute inset-0 opacity-60"
            style={{ backgroundImage: 'radial-gradient(circle,#1E2D45 1.5px,transparent 1.5px)', backgroundSize: '8px 8px' }} />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom,rgba(212,175,55,0.06),rgba(212,175,55,0.14) 50%,rgba(212,175,55,0.06))' }} />
        </div>
      </div>

      {/* R3F Canvas — no CSS filter (avoids white-bg compositing bug) */}
      <div
        ref={canvasWrapperRef}
        className="absolute z-40 pointer-events-none"
        style={{ width: '260px', height: '260px', left: '50%', top: '0%', transform: 'translate(-50%,-50%)' }}
      >
        <WebGLErrorBoundary>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 42, near: 0.1, far: 100 }}
            gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
            dpr={[1, 1.5]}
            style={{ width: '100%', height: '100%', background: 'transparent' }}
            frameloop="always"
            onCreated={({ gl, scene }) => {
              scene.background = null;
              gl.setClearColor(0x000000, 0);
            }}
          >
            <ambientLight intensity={3.5} />
            <directionalLight position={[5, 10, 8]}  intensity={5.0} color="#FFFAF0" />
            <directionalLight position={[-4, -4, -5]} intensity={2.5} color="#D4AF37" />
            <pointLight       position={[0, 4, 4]}    intensity={4.0} color="#F5B800" distance={14} />

            <LegoPlane progressRef={progressRef} directionRef={directionRef} />
          </Canvas>
        </WebGLErrorBoundary>
      </div>
    </>
  );
}
