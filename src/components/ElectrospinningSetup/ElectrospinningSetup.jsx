import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Cylinder, Sphere, Float, OrbitControls, ContactShadows, Tube, PerspectiveCamera } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import './ElectrospinningSetup.css';

// 1 & 3. Syringe with solution & Concentration Text
function Syringe({ concentrationStr, scanXRef }) {
  const groupRef = useRef();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.x = scanXRef.current;
    }
  });

  return (
    <group ref={groupRef} position={[0, 4, 0]}>
      {/* Syringe Barrel (Outer Glass) */}
      <Cylinder args={[0.6, 0.6, 3, 32]} position={[0, 1.5, 0]}>
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={0.9} 
          thickness={0.5} 
          roughness={0.05} 
          ior={1.5} 
          transparent 
        />
      </Cylinder>
      
      {/* Solution inside */}
      <Cylinder args={[0.55, 0.55, 2.8, 32]} position={[0, 1.4, 0]}>
        <meshPhysicalMaterial 
          color="#38bdf8" 
          transmission={0.3} 
          opacity={0.8} 
          transparent 
          metalness={0.1}
          roughness={0.2}
        />
      </Cylinder>

      {/* Syringe Tip / Luer Lock Connector */}
      <Cylinder args={[0.2, 0.6, 0.4, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </Cylinder>
      
      {/* Needle */}
      <Cylinder args={[0.04, 0.04, 1.2, 16]} position={[0, -0.6, 0]}>
        <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.05} />
      </Cylinder>

      {/* Taylor Cone (Liquid buildup at tip) */}
      <mesh position={[0, -1.2, 0]}>
        <coneGeometry args={[0.08, 0.15, 16]} />
        <meshPhysicalMaterial 
          color="#38bdf8" 
          emissive="#38bdf8" 
          emissiveIntensity={0.5} 
          transmission={0.5} 
          transparent 
        />
      </mesh>

      {/* Syringe Plunger Parts */}
      <Cylinder args={[0.58, 0.58, 0.2, 32]} position={[0, 3, 0]}>
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </Cylinder>
      <Cylinder args={[0.1, 0.1, 1.5, 16]} position={[0, 3.8, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </Cylinder>
      <Cylinder args={[0.8, 0.8, 0.1, 32]} position={[0, 4.6, 0]}>
        <meshStandardMaterial color="#1e293b" />
      </Cylinder>

      <Text
        position={[1.5, 1.5, 0]}
        fontSize={0.35}
        color="#ffffff"
        anchorX="left"
        anchorY="middle"
      >
        {`SOLVENT: ETHANOL\nCONC: ${concentrationStr}`}
      </Text>
    </group>
  );
}

// 2. Dynamic Liquid Jet (Whipping Animation)
function LiquidBeam({ flowRate, playbackSpeed, isPlaying, scanXRef }) {
  const lineRef = useRef();
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 2.8, 0),    // Needle tip
      new THREE.Vector3(0, 1.5, 0),    // Stable jet region
      new THREE.Vector3(0.5, 0.5, 0),  // Whipping starts
      new THREE.Vector3(-0.8, -1.0, 0),
      new THREE.Vector3(1.2, -3.0, 0),
      new THREE.Vector3(0, -4.8, 0),   // Hit drum roller surface
    ]);
  }, []);

  useFrame((state) => {
    if (!isPlaying) return;
    const time = state.clock.elapsedTime * playbackSpeed;
    
    const currentScanX = scanXRef.current;
    
    // Animate curve points to simulate "whipping" instability
    const instability = Math.min(2, flowRate * 0.5);
    curve.points[0].x = currentScanX;
    curve.points[1].x = currentScanX;
    curve.points[2].x = Math.sin(time * 5) * 0.2 * instability;
    curve.points[3].x = Math.cos(time * 8) * 0.6 * instability;
    curve.points[3].z = Math.sin(time * 7) * 0.6 * instability;
    curve.points[4].x = Math.sin(time * 12) * 1.5 * instability;
    curve.points[4].z = Math.cos(time * 10) * 1.5 * instability;
    
    // Sync impact point to orbit with drum for "rolling" effect
    curve.points[5].x = currentScanX + Math.sin(time * 10) * 0.1;
    curve.points[5].z = Math.cos(time * 10) * 0.1;

    if (lineRef.current && lineRef.current.geometry) {
      lineRef.current.geometry.setFromPoints(curve.getPoints(50));
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#38bdf8" linewidth={2} transparent opacity={0.6} />
    </line>
  );
}

// 4 & 7. Drum Roller and depositing fiber
function DrumRoller({ playbackSpeed, isPlaying, resetTrigger, scanXRef }) {
  const drumRef = useRef();
  const matRef = useRef();
  
  // Track deposition 'dose' across the drum length (-3 to 3)
  const doseArray = useRef(new Float32Array(64).fill(0));

  // Create a procedural texture for both alpha and bump
  const doseTexture = useMemo(() => {
    const size = 64;
    const data = new Uint8Array(size * 4);
    const tex = new THREE.DataTexture(data, size, 1, THREE.RGBAFormat);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  // Simple Noise Texture for "fibrous" look when zooming in
  const fiberTexture = useMemo(() => {
    const size = 256;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
        const val = Math.random() * 255;
        data[i * 4] = val;
        data[i * 4 + 1] = val;
        data[i * 4 + 2] = val;
        data[i * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 2);
    tex.needsUpdate = true;
    return tex;
  }, []);

  useEffect(() => {
    if (resetTrigger > 0) {
      doseArray.current.fill(0);
      // Manually clear texture buffer for instant feedback
      if (doseTexture.image.data) {
        doseTexture.image.data.fill(0);
        doseTexture.needsUpdate = true;
      }
      if (matRef.current) {
        matRef.current.scale.set(1, 1, 1);
      }
    }
  }, [resetTrigger, doseTexture]);
  
  useFrame((state, delta) => {
    if (!isPlaying) return;
    const safeDelta = Math.min(delta, 0.1);

    if (drumRef.current) {
      drumRef.current.rotation.x -= safeDelta * playbackSpeed * 1.5;
    }

    // Accumulate dose at current scanX position
    const currentScanX = scanXRef.current;
    const normalizedPos = (currentScanX + 2.5) / 5;
    const index = Math.floor(Math.max(0, Math.min(63, normalizedPos * 63)));
    
    // Spread the dose slightly for realism
    for (let i = -3; i <= 3; i++) {
      const idx = index + i;
      if (idx >= 0 && idx < 64) {
        const falloff = 1 - Math.abs(i) / 4;
        doseArray.current[idx] = Math.min(1.0, doseArray.current[idx] + safeDelta * playbackSpeed * 0.1 * falloff);
        
        // Update texture data directly
        const val = doseArray.current[idx] * 255;
        doseTexture.image.data[idx * 4] = 255;       // R
        doseTexture.image.data[idx * 4 + 1] = 255;   // G
        doseTexture.image.data[idx * 4 + 2] = 255;   // B
        doseTexture.image.data[idx * 4 + 3] = val;   // A
      }
    }
    doseTexture.needsUpdate = true;

    if (matRef.current) {
      // Dynamic scale based on average dose
      let sum = 0;
      for (let i = 0; i < 64; i++) sum += doseArray.current[i];
      const avgDose = sum / 64;
      const s = 1.0 + avgDose * 0.12;
      matRef.current.scale.set(s, 1, s);
    }
  });

  return (
    <group position={[0, -5, 0]}>
      <group ref={drumRef}>
        {/* Steel Drum */}
        <Cylinder args={[1.5, 1.5, 6, 64]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </Cylinder>
        
        {/* Growing Fiber Mat with Progressive Reveal & Fiber Texture */}
        <Cylinder ref={matRef} args={[1.51, 1.51, 5.95, 64]} rotation={[0, 0, Math.PI / 2]}>
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            alphaMap={doseTexture}
            bumpMap={fiberTexture}
            bumpScale={0.02}
            roughness={1.0}
            metalness={0.0}
          />
        </Cylinder>
      </group>
      
      {/* Supporting Hardware */}
      <Cylinder args={[0.2, 0.2, 8, 16]} rotation={[0, 0, Math.PI / 2]}>
        <meshStandardMaterial color="#334155" metalness={0.8} />
      </Cylinder>
      <group position={[-3.5, -2, 0]}>
        <Cylinder args={[0.4, 0.5, 4, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1e293b" />
        </Cylinder>
      </group>
      <group position={[3.5, -2, 0]}>
        <Cylinder args={[0.4, 0.5, 4, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1e293b" />
        </Cylinder>
      </group>
    </group>
  );
}

// 5. Digital Voltmeter & Power Supply
function Voltmeter({ voltage }) {
  return (
    <group position={[-5, -4, 0]}>
      {/* Power Supply Box */}
      <mesh>
        <boxGeometry args={[4, 3, 3]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Digital Display */}
      <mesh position={[0, 0, 1.51]}>
        <planeGeometry args={[3, 1.5]} />
        <meshBasicMaterial color="#020617" />
      </mesh>
      
      <Text
        position={[0, 0, 1.52]}
        fontSize={0.6}
        color="#ef4444"
      >
        {`${voltage || '0.0'} KV`}
      </Text>

      {/* Control Knob */}
      <Cylinder args={[0.3, 0.3, 0.2, 16]} rotation={[Math.PI/2, 0, 0]} position={[-1, -0.8, 1.5]}>
        <meshStandardMaterial color="#94a3b8" />
      </Cylinder>

      {/* High Voltage HV Cable */}
      <Tube args={[
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(2, 0, 0),
          new THREE.Vector3(4, 3, 0),
          new THREE.Vector3(1.5, 5, 0),
          new THREE.Vector3(0, 4, 0), // Connected to syringe
        ]), 40, 0.08, 8, false
      ]}>
        <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" emissiveIntensity={0.5} />
      </Tube>
    </group>
  );
}


// Scanning Logic Manager (Must be inside Canvas to use useFrame)
function ScanningManager({ isPlaying, playbackSpeed, scanXRef }) {
  useFrame((state) => {
    if (!isPlaying) return;
    const time = state.clock.elapsedTime * playbackSpeed * 0.2;
    // Oscillate needle between -2.5 and 2.5
    scanXRef.current = Math.sin(time) * 2.5;
  });
  return null;
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
  const scanXRef = useRef(0);
  
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
        dpr={[1, 2]}
        gl={{ 
          powerPreference: "high-performance",
          antialias: true,
        }}
      >
        <color attach="background" args={["#010409"]} />
        <fog attach="fog" args={["#010409", 10, 80]} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, 5, -10]} intensity={1} color="#0ea5e9" />
        <spotLight 
          position={[0, 8, 0]} 
          angle={0.15} 
          penumbra={1} 
          intensity={50} 
          color="#38bdf8" 
        />
        <directionalLight position={[0, -5, 5]} intensity={0.5} />
        
        <ContactShadows 
          resolution={1024} 
          scale={30} 
          blur={2} 
          opacity={0.5} 
          far={20} 
          color="#000000" 
          position={[0, -8, 0]} 
        />

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
        <ScanningManager isPlaying={isPlaying} playbackSpeed={playbackSpeed} scanXRef={scanXRef} />


        <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
          <group position={[0, 1, 0]}>
            <Syringe concentrationStr={concStr} scanXRef={scanXRef} />
            <LiquidBeam flowRate={parseFloat(rawFlowRate)} playbackSpeed={playbackSpeed} isPlaying={isPlaying} scanXRef={scanXRef} />
            <DrumRoller playbackSpeed={playbackSpeed} isPlaying={isPlaying} resetTrigger={resetTrigger} scanXRef={scanXRef} />
            <Voltmeter voltage={voltage} />
          </group>
        </Float>
      </Canvas>
    </div>
  );
}
