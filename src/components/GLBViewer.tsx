"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

interface GLBViewerProps {
  url: string;
}

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = maxDim > 0 ? 1.5 / maxDim : 1;

      scene.scale.set(scale, scale, scale);
      scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    }
  }, [scene]);

  return <primitive object={scene} ref={groupRef} />;
}

function GLBViewerContent({ url }: GLBViewerProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 3]} fov={50} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} />
      <Suspense
        fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#0066FF" wireframe />
          </mesh>
        }
      >
        <Model url={url} />
      </Suspense>
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={10}
      />
    </>
  );
}

export default function GLBViewer({ url }: GLBViewerProps) {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="w-full h-[600px] bg-gray-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
        <p className="text-xs text-red-600 font-mono uppercase tracking-wider">
          Failed to load 3D model
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-gray-50 border-2 border-[#0066FF]/20 rounded-lg overflow-hidden">
      <Canvas
        onError={(err) => {
          console.error("Canvas error:", err);
          setError("Failed to render 3D model");
        }}
      >
        <GLBViewerContent url={url} />
      </Canvas>
    </div>
  );
}
