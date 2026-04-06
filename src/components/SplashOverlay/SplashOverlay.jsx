import React, { useState, useEffect } from "react";
import "./SplashOverlay.css";
import logo from "../../assets/logo.png";

export default function SplashOverlay({ duration = 4000 }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  // Don't render anything once the splash is done
  if (!visible) return null;

  return (
    <div
      className="splash-overlay"
      style={{ "--splash-duration": `${duration}ms` }}
    >
      <div className="splash-content">
        {/* Decorative pulsing ring behind the logo */}
        <div className="splash-ring" />

        <img
          src="https://upload.wikimedia.org/wikipedia/en/thumb/b/b3/Bharati_Vidyapeeth_logo.png/220px-Bharati_Vidyapeeth_logo.png"
          alt="Bharati Vidyapeeth Logo"
          className="splash-logo"
          onError={(e) => {
            e.target.src = logo;
          }}
        />

        <h1 className="splash-title">LabHour</h1>
        <p className="splash-tagline">Bharati Vidyapeeth (Deemed to be University)</p>
      </div>
    </div>
  );
}
