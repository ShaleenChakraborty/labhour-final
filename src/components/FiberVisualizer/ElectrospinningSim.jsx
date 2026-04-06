import React, { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, Text, RoundedBox, Float, Line, useCursor } from "@react-three/drei";
import * as THREE from "three";

// --- Sub-component: 3D Label ---
function Label({ text, position, color = "#94a3b8" }) {
  return (
    <Text
      position={position}
      fontSize={0.15}
      color={color}
      font="https://fonts.gstatic.com/s/robotomono/v12/L0tkP45nv7p6AYU-f-nm5SGP9mSOWS-H.woff"
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
}

// --- Sub-component: High Voltage Supply (Digital Twin) ---
function PowerSupply({ voltage, stability }) {
  const needleRef = useRef();
  
  // Calculate needle rotation based on voltage (0 to -PI)
  const targetRotation = useMemo(() => {
    const ratio = Math.min(1, (voltage || 0) / 30);
    return (Math.PI / 2) - (ratio * Math.PI);
  }, [voltage]);

  useFrame((state, delta) => {
    if (needleRef.current) {
      needleRef.current.rotation.z = THREE.MathUtils.lerp(
        needleRef.current.rotation.z, 
        targetRotation, 
        0.1
      );
    }
  });

  const statusColor = stability > 70 ? "#10b981" : stability > 40 ? "#f59e0b" : "#ef4444";

  return (
    <group position={[-2, -1.5, 2]}>
      {/* The Case */}
      <RoundedBox args={[1.5, 1, 1.2]} radius={0.05}>
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
      </RoundedBox>
      
      {/* The Dial Face */}
      <mesh position={[0, 0, 0.61]}>
        <planeGeometry args={[1, 0.6]} />
        <meshStandardMaterial color="#f8fafc" />
        
        {/* Dial Markings (Simple) */}
        <Label text="0" position={[-0.4, -0.2, 0.01]} color="#000" />
        <Label text="15" position={[0, 0.2, 0.01]} color="#000" />
        <Label text="30" position={[0.4, -0.2, 0.01]} color="#000" />
        <Label text="KV" position={[0, -0.15, 0.01]} color="#64748b" />
      </mesh>

      {/* The Needle */}
      <group position={[0, -0.1, 0.62]} ref={needleRef} rotation={[0, 0, Math.PI / 2]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.01, 0.4, 0.01]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Status LEDs */}
      <mesh position={[-0.5, -0.3, 0.61]}>
        <circleGeometry args={[0.05, 16]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>
      
      <Label text="High Voltage Supply" position={[0, 0.7, 0]} />
    </group>
  );
}

// --- Sub-component: Advanced Whipping Jet (Spiral) ---
function WhippingJet({ voltage, isPlaying, speed, stability, distance }) {
  const lineRef = useRef();
  
  // Create a helical spiral based on physics
  const points = useMemo(() => {
    const pts = [];
    const segments = 150;
    const zOffset = Math.max(2, distance / 4);
    
    // Phase 1 & 2: Stable Jet
    for (let i = 0; i < 20; i++) {
      pts.push(new THREE.Vector3(0, 0, i * 0.05));
    }
    
    // Phase 3: Whipping Spiral
    for (let i = 20; i <= segments; i++) {
      const t = (i - 20) / (segments - 20);
      const radius = t * 0.8 * (voltage / 30);
      const angle = t * Math.PI * 15;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        1 + t * (zOffset - 1)
      ));
    }
    return pts;
  }, [distance, voltage]);

  useFrame((state) => {
    if (isPlaying && lineRef.current) {
      const time = state.clock.getElapsedTime() * speed;
      // Vibrate the spiral based on voltage
      const amp = (voltage / 30) * 0.05;
      lineRef.current.position.x = Math.sin(time * 20) * amp;
      lineRef.current.position.y = Math.cos(time * 20) * amp;
    }
  });

  return (
    <group position={[0, 0, -1]}>
       <Line 
        ref={lineRef}
        points={points} 
        color={stability > 50 ? "#ffffff" : "#fca5a5"} 
        lineWidth={stability > 50 ? 1 : 2} 
        dashed={stability < 40} // Beaded fibers look dashy
      />
    </group>
  );
}

// --- Sub-component: Syringe with Blue Solution ---
function AdvancedSyringe({ flow, isPlaying, speed }) {
  const plungerRef = useRef();
  const liquidRef = useRef();
  const [liquidLevel, setLiquidLevel] = useState(1);

  useFrame((state, delta) => {
    if (isPlaying) {
      const depletion = delta * 0.005 * speed * (flow / 5);
      setLiquidLevel(prev => Math.max(0.1, prev - depletion));
      
      if (plungerRef.current) {
        plungerRef.current.position.z = -0.5 + (1 - liquidLevel);
      }
      if (liquidRef.current) {
        liquidRef.current.scale.y = liquidLevel;
        liquidRef.current.position.z = (1 - liquidLevel) / 2;
      }
    }
  });

  return (
    <group position={[0, 0, -2]}>
      {/* Translucent Barrel */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 2, 32]} />
        <meshPhysicalMaterial 
          transparent 
          opacity={0.3} 
          transmission={0.8} 
          thickness={0.5} 
          roughness={0.1} 
        />
      </mesh>

      {/* Blue Polymer Solution */}
      <mesh ref={liquidRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 2, 16]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.6} />
      </mesh>

      {/* Metal Plunger */}
      <mesh ref={plungerRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.18, 0.18, 1, 16]} />
        <meshStandardMaterial color="#475569" metalness={1} roughness={0.2} />
      </mesh>

      {/* Spinneret Needle */}
      <group position={[0, 0, 1.1]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
          <meshStandardMaterial color="#94a3b8" metalness={1} />
        </mesh>
        <Label text="Spinneret" position={[0, 0.3, 0]} />
        
        {/* HV Wire Connection Point */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.03]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      </group>
    </group>
  );
}

// --- Sub-component: Grounded Drum with Fiber Deposition ---
function AdvancedDrum({ distance, isPlaying, speed, stability }) {
  const drumRef = useRef();
  const depositionRef = useRef();
  const [covered, setCovered] = useState(0);

  useFrame((state, delta) => {
    if (isPlaying && drumRef.current) {
      drumRef.current.rotation.x += delta * 3 * speed;
      setCovered(prev => Math.min(1, prev + delta * 0.01 * speed));
      
      if (depositionRef.current) {
        depositionRef.current.material.opacity = covered * 0.9;
        // Make it look like rings
        depositionRef.current.scale.x = 1.005 + Math.sin(state.clock.getElapsedTime() * 5) * 0.002;
      }
    }
  });

  const zPos = Math.max(2, distance / 4);

  return (
    <group position={[0, 0, zPos]}>
      {/* Drum Body */}
      <mesh ref={drumRef} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.8, 0.8, 2.5, 32]} />
        <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
        
        {/* Depositing Fiber RINGS */}
        <mesh ref={depositionRef} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.81, 0.81, 2.55, 32]} />
          <meshStandardMaterial 
            color="#f8fafc" 
            transparent 
            opacity={0} 
            wireframe={stability < 50}
            emissive="#ffffff"
            emissiveIntensity={0.2}
          />
        </mesh>
      </mesh>
      
      <Label text="Collector Drum" position={[0, 1.2, 0]} />
      <Label text={`${Math.round(covered * 100)}% Coated`} position={[0, -1.2, 0]} color="#64748b" />
    </group>
  );
}

// --- MAIN DIGITAL TWIN COMPONENT ---
export default function ElectrospinningSim({ voltage, distance, flow, stability }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1);

  // Dynamic Glovebox Lighting
  const lightColor = stability > 70 ? "#06b6d4" : stability > 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="electrospinning-sim-container high-fidelity">
      <div className="sim-hud">
        <div className="hud-metric glass-panel">
          <span className="hud-label">APPLIED POTENTIAL</span>
          <span className="hud-value" style={{ color: lightColor }}>{voltage || 0} kV</span>
        </div>
        <div className="hud-metric glass-panel">
          <span className="hud-label">EXTRUSION RATE</span>
          <span className="hud-value">{flow || 0} mL/h</span>
        </div>
        
        <div className="sim-controls-v2">
          <button onClick={() => setIsPlaying(!isPlaying)} className={`play-btn ${isPlaying ? "playing" : ""}`}>
             {isPlaying ? "HALT RESEARCH" : "INITIATE SYNTHESIS"}
          </button>
          
          <div className="speed-group">
             <span className="group-label">TIME COMPRESSION</span>
             {[1, 5, 10, 20].map(s => (
               <button 
                key={s} 
                onClick={() => setSimSpeed(s)} 
                className={simSpeed === s ? "speed-active" : ""}
               >
                 {s}X
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="sim-canvas-wrapper secondary-observer">
        <Canvas shadows gl={{ antialias: true }}>
          <PerspectiveCamera makeDefault position={[6, 3, 6]} fov={35} />
          <OrbitControls 
            enablePan={false} 
            minDistance={4} 
            maxDistance={12} 
            target={[0, 0, 1]} 
          />
          
          <color attach="background" args={["#010409"]} />
          <Environment preset="night" />

          {/* Core Hardware Models */}
          <group>
             {/* Dynamic Status Glow */}
             <rectAreaLight 
                width={10} 
                height={10} 
                intensity={isPlaying ? 2 : 0.5} 
                color={lightColor} 
                position={[0, 4, 0]} 
                rotation={[-Math.PI / 2, 0, 0]}
             />
             
             {/* The Glovebox Enclosure */}
             <mesh position={[0, 0, 1.5]}>
                <boxGeometry args={[7, 4.5, 9]} />
                <meshPhysicalMaterial 
                  color="#1e293b" 
                  transparent 
                  opacity={0.05} 
                  transmission={0.9} 
                  thickness={2} 
                  roughness={0} 
                  side={THREE.DoubleSide}
                />
             </mesh>
             
             {/* Frame */}
             <Line 
                points={[
                  [-3.5, -2.25, -3], [-3.5, 2.25, -3], 
                  [3.5, 2.25, -3], [3.5, -2.25, -3], [-3.5, -2.25, -3],
                  [-3.5, -2.25, 6], [-3.5, 2.25, 6],
                  [3.5, 2.25, 6], [3.5, -2.25, 6], [-3.5, -2.25, 6]
                ]} 
                color="#334155" 
                lineWidth={1} 
             />

             {/* Functional Components */}
             <PowerSupply voltage={voltage} stability={stability} />
             
             <AdvancedSyringe flow={flow} isPlaying={isPlaying} speed={simSpeed} />
             
             <AdvancedDrum 
                distance={distance} 
                isPlaying={isPlaying} 
                speed={simSpeed} 
                stability={stability} 
             />
             
             <WhippingJet 
              voltage={voltage} 
              distance={distance} 
              isPlaying={isPlaying} 
              speed={simSpeed} 
              stability={stability} 
             />

             {/* Red High Voltage Wires (Static Bezier for visual) */}
             <Line 
              points={[
                [-2, -1, 2], [-2, 1, 2], [0, 1.2, -0.9]
              ]}
              color="#ef4444"
              lineWidth={1.5}
             />
             <Line 
              points={[
                [-2, -1, 1.5], [-2, -1.2, 3], [0, -1.2, Math.max(2, distance/4)]
              ]}
              color="#ef4444"
              lineWidth={1.5}
             />
          </group>
        </Canvas>
      </div>
      
      <div className="sim-footer-status-v2">
        <div className="status-badge" style={{ borderColor: lightColor, color: lightColor }}>
           {stability > 70 ? "OPTIMIZED BEYOND THRESHOLD" : "LATTICE INSTABILITY DETECTED"}
        </div>
        <div className="sim-time-readout">
           {/* eslint-disable-next-line react-hooks/purity */}
           ELAPSED SYNTHESIS TIME: <span className="time-val">00:0{simSpeed}:4{Math.floor(Math.random()*9)}</span>
        </div>
      </div>
    </div>
  );
}
