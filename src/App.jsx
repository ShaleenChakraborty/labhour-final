import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Pages/Dashboard/Dashboard";
import About from "./Pages/About/About";
import Utility from "./Pages/Utility/Utility";
import Contact from "./Pages/Contact/Contact";
import Home from "./Pages/Home/Home";
import Nylon6 from "./Pages/Materials/Nylon6/Nylon6";
import PAN from "./Pages/Materials/PAN/PAN";
import PES from "./Pages/Materials/PES/PES";
import TiO2PVP from "./Pages/Materials/TiO2PVP/TiO2PVP";
import ZnOPVP from "./Pages/Materials/ZnOPVP/ZnOPVP";
import Profile from "./Pages/Profile/Profile";
import { SearchProvider } from "./context/SearchContext";
import SplashOverlay from "./components/SplashOverlay/SplashOverlay";

import { useEffect } from "react";

function App() {
  useEffect(() => {
    // 🛡️ Initialize guest session for standalone deployment
    if (!localStorage.getItem("guest") && !localStorage.getItem("token")) {
      localStorage.setItem("guest", "true");
    }
  }, []);

  return (
    <SearchProvider>
      <SplashOverlay duration={4000} />
      <BrowserRouter>
        <Routes>

          {/* 🔥 ROOT REDIRECT - DIRECT TO DASHBOARD */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* DASHBOARD LAYOUT */}
          <Route path="/dashboard" element={<Dashboard />}>

            {/* HOME */}
            <Route index element={<Home />} />

            {/* OTHER PAGES */}
            <Route path="about" element={<About />} />
            <Route path="utility" element={<Utility />} />
            <Route path="contact" element={<Contact />} />
            <Route path="profile" element={<Profile />} />

            {/* MATERIALS */}
            <Route path="materials/nylon-6" element={<Nylon6 />} />
            <Route path="materials/pan" element={<PAN />} />
            <Route path="materials/pes" element={<PES />} />
            <Route path="materials/tio2-pvp" element={<TiO2PVP />} />
            <Route path="materials/zno-pvp" element={<ZnOPVP />} />

          </Route>

          {/* 🔥 GLOBAL FALLBACK (VERY IMPORTANT) */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </BrowserRouter>
    </SearchProvider>
  );
}

export default App;