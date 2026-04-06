import React, { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Float, ContactShadows, Stars } from "@react-three/drei";
import * as THREE from "three";
import "./FiberVisualizer.css";

// Procedural Mesh Group for the microscopic web
function NanofiberWeb({ diameter, structure }) {
  const scaledThickness = Math.max(0.015, (diameter || 150) / 1500); 

  const radialSegments = useMemo(() => {
    const s = String(structure || "").toLowerCase();
    if (s.includes("hexagonal")) return 6;
    if (s.includes("cubic") || s.includes("tetragonal") || s.includes("orthorhombic")) return 4;
    return 32;
  }, [structure]);

  const strands = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 60; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 3
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ],
        length: 10 + Math.random() * 8
      });
    }
    return temp;
  }, []);

  const isCrystalline = structure?.toLowerCase().includes("crystalline") || 
                        radialSegments < 32;

  const materialProps = {
    color: "#cbd5e1", 
    emissive: "#0ea5e9",
    emissiveIntensity: isCrystalline ? 0.2 : 0.05,
    roughness: isCrystalline ? 0.15 : 0.8,
    metalness: isCrystalline ? 0.9 : 0.2,
    clearcoat: isCrystalline ? 1.0 : 0.0,
    clearcoatRoughness: 0.1,
  };

  return (
    <group>
      {strands.map((strand, i) => (
        <mesh key={i} position={strand.position} rotation={strand.rotation}>
          <cylinderGeometry args={[scaledThickness, scaledThickness, strand.length, radialSegments]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      ))}
    </group>
  );
}

function CameraTracker({ diameter, magRef, scaleTextRef, scaleBarRef }) {
  const { camera, size } = useThree();
  const baseThickness = Math.max(0.015, (diameter || 150) / 1500); 
  const nanometersPerWorldUnit = (diameter || 150) / baseThickness;

  useFrame(() => {
    const dist = camera.position.length();

    // 1. Updating Mag
    const magRaw = dist > 0.1 ? (250 / dist) : 2500;
    const mag = magRaw.toFixed(2);
    if (magRef.current) {
      magRef.current.textContent = `${mag} k X`;
    }

    // 2. Scale calculation
    const vFov = (camera.fov * Math.PI) / 180;
    const visibleHeightWorld = 2 * Math.tan(vFov / 2) * dist;
    
    // Safety check to avoid zero or NaN dimensions
    if (size.height > 0 && isFinite(visibleHeightWorld) && visibleHeightWorld > 0) {
      const worldUnitsPerPixel = visibleHeightWorld / size.height;
      const nmPerPixel = worldUnitsPerPixel * nanometersPerWorldUnit;
      
      if (!isFinite(nmPerPixel) || nmPerPixel <= 0) return;

      const initialBarNm = 100 * nmPerPixel; // Base target of 100px width
      
      const magnitude = Math.pow(10, Math.floor(Math.log10(initialBarNm)));
      const normalized = initialBarNm / magnitude;
      
      let niceMultiplier;
      if (normalized < 1.5) niceMultiplier = 1;
      else if (normalized < 3.5) niceMultiplier = 2;
      else if (normalized < 7.5) niceMultiplier = 5;
      else niceMultiplier = 10;

      const targetNm = niceMultiplier * magnitude;
      const pixelsWidth = targetNm / nmPerPixel;

      if (scaleTextRef.current) {
        scaleTextRef.current.textContent = targetNm >= 1000 
          ? `${(targetNm/1000).toFixed(targetNm % 1000 === 0 ? 0 : 1)} μm` 
          : `${targetNm.toFixed(0)} nm`;
      }
      
      if (scaleBarRef.current && isFinite(pixelsWidth) && pixelsWidth > 0) {
        // Use requestAnimationFrame for style updates to avoid layout thrashing
        const widthVal = `${Math.max(10, Math.min(size.width * 0.8, pixelsWidth))}px`;
        if (scaleBarRef.current.style.width !== widthVal) {
          scaleBarRef.current.style.width = widthVal;
        }
      }
    }
  });

  return null;
}

// FESEM Metadata Overlay (2D) — Static version (no nested Canvas)
function FESEMOverlay({ diameter, voltage, distance, structure, magRef, scaleTextRef, scaleBarRef }) {
  const mag = useMemo(() => {
    const d = diameter || 150;
    return (250 / 8).toFixed(2);
  }, [diameter]);

  const scaleLabel = useMemo(() => {
    const d = diameter || 150;
    if (d < 100) return "100 nm";
    if (d < 500) return "500 nm";
    return "1 μm";
  }, [diameter]);

  return (
    <div className="fesem-overlay">
      <div className="sem-header">
        <div className="sem-item"><span>EHT = </span>{voltage || "20.00"} kV</div>
        <div className="sem-item"><span>WD = </span>{distance || "12.0"} mm</div>
        <div className="sem-item"><span>Signal A = </span>InLens</div>
        <div className="sem-item"><span>Mag = </span><span ref={magRef}>{mag} k X</span></div>
      </div>

      <div className="sem-footer">
        <div className="sem-info-left">
          <div className="sem-item-main">LabHour NanoSynthesized Image</div>
          <div className="sem-item-sub">Structure: {structure || "Amorphous"}</div>
        </div>
        <div className="sem-scale-container">
          <div className="sem-scale-text" ref={scaleTextRef}>{scaleLabel}</div>
          <div className="sem-scale-bar" ref={scaleBarRef} style={{ width: '100px' }}></div>
        </div>
      </div>
    </div>
  );
}

export default function FiberVisualizer({ diameter, structure, voltage, distance }) {
  const magRef = useRef(null);
  const scaleTextRef = useRef(null);
  const scaleBarRef = useRef(null);

  if (diameter === null || diameter === undefined) return null;

  return (
    <div className="fiber-visualizer-container">
      <div className="visualizer-header">
        <h4>FESEM Morphological Simulation</h4>
        <p className="visualizer-badge">Scientific Mode</p>
      </div>
      <div className="canvas-wrapper">
        <FESEMOverlay 
          diameter={diameter} 
          voltage={voltage} 
          distance={distance} 
          structure={structure} 
          magRef={magRef} 
          scaleTextRef={scaleTextRef} 
          scaleBarRef={scaleBarRef} 
        />
        
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#bae6fd" />
          <pointLight position={[-10, 10, -5]} intensity={2} color="#0ea5e9" />
          
          <color attach="background" args={["#010409"]} /> 
          <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          <Environment preset="night" />

          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
            <NanofiberWeb diameter={diameter} structure={structure} />
          </Float>

          <CameraTracker 
            diameter={diameter} 
            magRef={magRef} 
            scaleTextRef={scaleTextRef} 
            scaleBarRef={scaleBarRef} 
          />

          <OrbitControls 
            makeDefault 
            autoRotate={false} 
            enablePan={false} 
            minDistance={2} 
            maxDistance={80} 
          />
          <ContactShadows resolution={1024} scale={15} blur={3} opacity={0.5} far={10} color="#000000" position={[0, -4, 0]} />
        </Canvas>
      </div>
    </div>
  );
}
