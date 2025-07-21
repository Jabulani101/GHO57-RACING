// RacingEngine.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Howl } from 'howler';

const CarModel = ({ position, rotation, engineSound }: any) => {
  const { scene } = useGLTF('/models/car.glb');
  const [speed, setSpeed] = useState(0);
  const maxSpeed = 180;

  const [ref, api] = useBox(() => ({
    mass: 1200,
    position,
    rotation,
    linearDamping: 0.95,
    angularDamping: 0.99
  }));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') api.applyForce([0, 0, -50], [0, 0, 0]);
      if (e.key === 'ArrowDown') api.applyForce([0, 0, 30], [0, 0, 0]);
      if (e.key === 'ArrowLeft') api.applyTorque([0, 5, 0]);
      if (e.key === 'ArrowRight') api.applyTorque([0, -5, 0]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [api]);

  useFrame(() => {
    api.velocity.subscribe((v) => {
      const currentSpeed = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2) * 3.6;
      setSpeed(currentSpeed);
      const rpm = Math.min(7000, (currentSpeed / maxSpeed) * 7000);
      engineSound.rate(0.8 + rpm / 7000);
    });
  });

  return <primitive object={scene} ref={ref} scale={[0.8, 0.8, 0.8]} />;
};

const RaceTrack = () => {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -1, 0],
    material: { friction: 0.1, restitution: 0.7 }
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color="#333333" />
    </mesh>
  );
};

const CameraController = () => {
  const { camera } = useThree();
  const [target] = useState(new THREE.Vector3());

  useFrame(({ mouse }) => {
    target.set(mouse.x * 2, mouse.y * 2, -5);
    camera.position.lerp(target, 0.05);
    camera.lookAt(0, 0, -10);
  });

  return null;
};

const RacingEngine = () => {
  const [engineSound, setEngineSound] = useState<Howl | null>(null);
  const [showAd, setShowAd] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const sound = new Howl({
      src: ['/sounds/engine.mp3'],
      loop: true,
      volume: 0.7
    });
    setEngineSound(sound);
    return () => sound.unload();
  }, []);

  const handlePremium = () => {
    setIsPremium(true);
    setShowAd(false);
  };

  const showAdBreak = () => {
    if (!isPremium) {
      setShowAd(true);
      setTimeout(() => setShowAd(false), 5000);
    }
  };

  return (
    <div className="relative h-screen w-full">
      {showAd && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
          <div className="text-center p-8 bg-gray-900 rounded-lg">
            <h2 className="text-2xl mb-4 text-yellow-500">PRE-RACE AD</h2>
            <p className="mb-6">Upgrade to Premium for ad-free racing</p>
            <button 
              onClick={handlePremium}
              className="bg-gradient-to-r from-yellow-500 to-red-600 px-6 py-3 rounded-full font-bold"
            >
              UNLOCK PREMIUM ($4.99/month)
            </button>
          </div>
        </div>
      )}
      <Canvas shadows camera={{ position: [0, 5, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <Physics>
          {engineSound && (
            <CarModel 
              position={[0, 0.5, 0]} 
              rotation={[0, Math.PI, 0]}
              engineSound={engineSound} 
            />
          )}
          <RaceTrack />
        </Physics>
        <Environment preset="city" />
        <OrbitControls />
        <CameraController />
      </Canvas>
    </div>
  );
};

export default RacingEngine;