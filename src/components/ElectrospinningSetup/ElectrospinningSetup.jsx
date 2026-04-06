import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Text, Cylinder, Sphere, Float, OrbitControls, ContactShadows, Tube, PerspectiveCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import './ElectrospinningSetup.css';

// 1 & 3. Syringe with solution & Concentration Text
function Syringe({ concentrationStr }) {
  return (
    <group position={[0, 4, 0]}>
      {/* Syringe Barrel */}
      <Cylinder args={[0.6, 0.6, 3, 32]} position={[0, 1.5, 0]}>
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} opacity={1} transparent roughness={0.1} thickness={0.5} />
      </Cylinder>
      {/* Solution inside */}
      <Cylinder args={[0.55, 0.55, 2.8, 32]} position={[0, 1.4, 0]}>
        <meshPhysicalMaterial color="#0ea5e9" transmission={0.2} opacity={0.8} transparent />
      </Cylinder>
      {/* Syringe Tip / Needle */}
      <Cylinder args={[0.05, 0.05, 1, 16]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </Cylinder>
      {/* Syringe Plunger */}
      <Cylinder args={[0.58, 0.58, 0.2, 32]} position={[0, 3, 0]}>
        <meshStandardMaterial color="#1e293b" />
      </Cylinder>
      <Cylinder args={[0.1, 0.1, 1.5, 16]} position={[0, 3.8, 0]}>
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
      </Cylinder>
      <Cylinder args={[0.8, 0.8, 0.1, 32]} position={[0, 4.6, 0]}>
        <meshStandardMaterial color="#1e293b" />
      </Cylinder>

      {/* Concentration Text */}
      <Text
        position={[1.2, 1.5, 0]}
        fontSize={0.4}
        color="#38bdf8"
        anchorX="left"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {`Solution\n${concentrationStr}`}
      </Text>
      
      {/* Taylor Cone at tip */}
      <Sphere args={[0.08, 16, 16]} position={[0, -1.0, 0]} scale={[1, 1.5, 1]}>
        <meshPhysicalMaterial color="#0ea5e9" transmission={0.5} opacity={0.9} transparent emissive="#0ea5e9" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
}

// 2. Liquid Beam
function LiquidBeam({ flowRate, playbackSpeed, isPlaying }) {
  const beamRef = useRef();
  
  // Create a dashed line material for the beam to simulate flow
  const dashMat = useMemo(() => {
    return new THREE.LineDashedMaterial({
      color: 0x38bdf8,
      linewidth: 2,
      scale: 1,
      dashSize: 0.2,
      gapSize: 0.1,
    });
  }, []);

  const points = useMemo(() => {
    const pts = [];
    pts.push(new THREE.Vector3(0, 3.0, 0)); // Start at needle tip
    pts.push(new THREE.Vector3(0, -3.8, 0)); // End at drum
    return pts;
  }, []);

  const lineGeom = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  useFrame((state, delta) => {
    if (beamRef.current && isPlaying) {
      beamRef.current.computeLineDistances();
      // Animate the dash offset to simulate flow
      // Base flow speed proportional to flow rate, multiplied by playback speed
      const speed = (flowRate || 1.0) * 2.0 * playbackSpeed;
      dashMat.dashOffset -= delta * speed;
    }
  });

  return (
    <line ref={beamRef} geometry={lineGeom} material={dashMat} />
  );
}

// 4 & 7. Drum Roller and depositing fiber
function DrumRoller({ playbackSpeed, isPlaying, resetTrigger }) {
  const drumRef = useRef();
  const matRef = useRef();
  // Fixed: Remove the fibers state entirely. 
  // Updating state in useFrame (60-144fps) is the primary cause of desktop freezes.
  // Instead, we will simulate the fiber build-up solely through the matRef.

  // Handle Restart
  useEffect(() => {
    if (resetTrigger > 0) {
      if (matRef.current) {
        if (matRef.current.material) {
          matRef.current.material.opacity = 0.0;
        }
        matRef.current.scale.setScalar(1);
      }
    }
  }, [resetTrigger]);
  
  // Rotate drum
  useFrame((state, delta) => {
    if (!isPlaying || !isFinite(delta)) return;

    // Safety: Cap delta to prevent huge jumps from tab switching
    const safeDelta = Math.min(delta, 0.1);

    if (drumRef.current) {
      // RPM scaled by playback speed
      const rotationDelta = safeDelta * Math.min(playbackSpeed, 10) * 2.0;
      if (isFinite(rotationDelta)) {
        drumRef.current.rotation.x -= rotationDelta;
      }
    }

    if (matRef.current) {
      // Very slowly increase opacity representing the massive collection of invisible nanofibers turning into a visible mat
      // Increased speed slightly to compensate for the removal of individual fiber lines
      if (matRef.current.material.opacity < 0.95) {
        const opacityGain = safeDelta * Math.min(playbackSpeed, 10) * 0.025;
        if (isFinite(opacityGain)) {
          matRef.current.material.opacity += opacityGain;
        }
      }
      // Slowly increase thickness (radius)
      if (matRef.current.scale.x < 1.05) {
        const scaleGain = safeDelta * Math.min(playbackSpeed, 10) * 0.0003;
        const s = matRef.current.scale.x + scaleGain;
        if (isFinite(s)) {
          matRef.current.scale.set(s, 1, s);
        }
      }
    }
  });

  return (
    <group position={[0, -5, 0]}>
      {/* Drum Body */}
      <group ref={drumRef}>
        <Cylinder args={[1.5, 1.5, 6, 64]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.4} />
        </Cylinder>
        
        {/* The overall collected nanofiber mat slowly fading in over time */}
        {/* We use a slightly noisy texture or just the surface to represent the mat */}
        <Cylinder ref={matRef} args={[1.505, 1.505, 5.9, 64]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial 
            color="#f8fafc" 
            transparent 
            opacity={0.0} 
            roughness={0.9} 
            metalness={0.0} 
          />
        </Cylinder>
      </group>
      
      {/* Drum Stand/Axle */}
      <Cylinder args={[0.2, 0.2, 7, 16]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#0f172a" metalness={0.8} />
      </Cylinder>
      <Cylinder args={[0.3, 0.3, 3, 16]} position={[-3.5, -1.5, 0]}>
        <meshStandardMaterial color="#1e293b" />
      </Cylinder>
      <Cylinder args={[0.3, 0.3, 3, 16]} position={[3.5, -1.5, 0]}>
        <meshStandardMaterial color="#1e293b" />
      </Cylinder>
    </group>
  );
}

// 5. Voltmeter UI in 3D
function Voltmeter({ voltage }) {
  return (
    <group position={[-3, 1, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 1.0, 0.5]} />
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Screen */}
      <mesh position={[0, 0.1, 0.26]}>
        <planeGeometry args={[1.2, 0.6]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
      <Text
        position={[0, 0.1, 0.27]}
        fontSize={0.25}
        color="#ef4444"
        anchorX="center"
        anchorY="middle"
      >
        {`${voltage || '0.0'} kV`}
      </Text>
      
      {/* High Voltage Wire */}
      <Tube args={[
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.5, 0, 0),
          new THREE.Vector3(1.5, -0.5, 0),
          new THREE.Vector3(2.5, 1, 0),
          new THREE.Vector3(3.0, 2, 0),
        ]), 20, 0.05, 8, false
      ]}>
        <meshStandardMaterial color="#ef4444" />
      </Tube>
    </group>
  );
}


// Camera Animation Handler
function CameraHandler({ preset }) {
  const { camera } = useThree();
  const lastPreset = useRef(null);
  const isAnimating = useRef(false);

  // When preset changes, mark as animating
  useEffect(() => {
    if (preset !== lastPreset.current) {
      isAnimating.current = true;
      lastPreset.current = preset;
    }
  }, [preset]);

  useFrame((state, delta) => {
    if (!preset || !isAnimating.current) return;

    // Detect user interaction to stop animation
    if (state.controls && state.controls.active) {
      isAnimating.current = false;
      return;
    }

    const targetPos = new THREE.Vector3(...preset.pos);
    const targetLookAt = new THREE.Vector3(...preset.target);

    // Smoothly lerp camera position
    camera.position.lerp(targetPos, delta * 4);

    // Smoothly lerp controls target
    if (state.controls) {
      state.controls.target.lerp(targetLookAt, delta * 4);
      state.controls.update();
    }

    // Stop animating if we're very close to the target
    if (camera.position.distanceTo(targetPos) < 0.1) {
      isAnimating.current = false;
    }
  });

  return null;
}


export default function ElectrospinningSetup({ params }) {
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);
  
  const presets = {
    overview: { pos: [15, 8, 25], target: [0, -1, 0], label: "Overview" },
    front: { pos: [0, 0, 30], target: [0, -1, 0], label: "Front" },
    side: { pos: [30, 0, 0], target: [0, -1, 0], label: "Side" },
    top: { pos: [0, 35, 0], target: [0, -1, 0], label: "Top" },
    needle: { pos: [0, 4, 8], target: [0, 4, 0], label: "Needle" },
  };

  const [currentPreset, setCurrentPreset] = useState(presets.overview);

  const handleRestart = () => {
    setResetTrigger(prev => prev + 1);
    setIsPlaying(true);
  };

  // Extract params
  const voltage = params?.voltage || 15;
  const rawFlowRate = params?.flow || params?.FR || 1.0;
  
  // We need to find the concentration string. 
  // It could be under "concentration", "zno", "pvp", "ttip", etc. based on the material logic.
  let concStr = "";
  if (params?.concentration) concStr = `${params.concentration}%`;
  else if (params?.zno && params?.pvp) concStr = `ZnO ${params.zno}% / PVP ${params.pvp}%`;
  else if (params?.ttip && params?.pvp) concStr = `TTIP ${params.ttip}% / PVP ${params.pvp}%`;
  else concStr = "Solution";

  return (
    <div className="electrospinning-setup-container">
      
      {/* UI Overlay */}
      <div className="setup-overlay">
        <div className="setup-header">
          <div className="setup-badge">Apparatus Simulation</div>
        </div>

        <div className="setup-controls-panel" onPointerDown={(e) => e.stopPropagation()}>
          <div className="setup-controls">
            <h5>
              Simulation Speed 
              <span className="speed-value">{playbackSpeed}x</span>
            </h5>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={playbackSpeed} 
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="speed-slider"
            />
            
            <div className="playback-controls">
              <button className="control-btn" onPointerDown={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
              <button className="control-btn" onPointerDown={handleRestart}>
                🔄 Restart
              </button>
            </div>
          </div>
        </div>

        <div className="view-presets-panel" onPointerDown={(e) => e.stopPropagation()}>
          <div className="view-presets">
            <div className="presets-label">View Presets</div>
            <div className="presets-grid">
              {Object.entries(presets).map(([key, value]) => (
                <button 
                  key={key}
                  className={`preset-btn ${currentPreset === value ? 'active' : ''}`}
                  onClick={() => setCurrentPreset(value)}
                >
                  {value.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        
        <div className="setup-footer">
          <div className="data-panel">
            <div className="data-label">Flow Rate</div>
            <div className="data-value">{rawFlowRate} mL/h</div>
          </div>
          <div className="data-panel">
            <div className="data-label">Voltage</div>
            <div className="data-value">{voltage} kV</div>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas 
        camera={{ position: [15, 8, 25], fov: 40 }}
        dpr={1}
        gl={{ 
          powerPreference: "high-performance",
          antialias: false,
          stencil: false,
          depth: true
        }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <pointLight position={[-10, 0, -5]} intensity={1} color="#0ea5e9" />
        
        {/* Replaced heavy Environment with simpler lights for stability */}
        <pointLight position={[5, 5, 5]} intensity={0.5} />
        
        {/* Contact Shadow for realism - reduced resolution */}
        <ContactShadows resolution={512} scale={30} blur={2.5} opacity={0.4} far={20} color="#000000" position={[0, -8, 0]} />

        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.05}
          rotateSpeed={0.8}
          minDistance={5} 
          maxDistance={60}
          makeDefault
        />

        <CameraHandler preset={currentPreset} />


        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
          <group position={[0, 1, 0]}>
            <Syringe concentrationStr={concStr} />
            <LiquidBeam flowRate={parseFloat(rawFlowRate)} playbackSpeed={playbackSpeed} isPlaying={isPlaying} />
            <DrumRoller playbackSpeed={playbackSpeed} isPlaying={isPlaying} resetTrigger={resetTrigger} />
            <Voltmeter voltage={voltage} />
          </group>
        </Float>
      </Canvas>
    </div>
  );
}
