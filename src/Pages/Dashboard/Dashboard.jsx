// Dashboard.jsx - FULLY FIXED

import "./Dashboard.css";
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import SplashOverlay from "../../components/SplashOverlay/SplashOverlay";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const duration = useMemo(() => {
    return sessionStorage.getItem("splashShown") ? 0 : 4000;
  }, []);

  useEffect(() => {
    // ✅ Mark splash as shown so subsequent navigations skip it
    sessionStorage.setItem("splashShown", "true");
  }, []);


  return (
    <div className="dashboard">

      {/* ✅ duration is now stable — never changes between renders */}
      <SplashOverlay duration={duration} />
      
      <div className={`dashboard-layout ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <div className="main">
          <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <div className="content">
            <div className="content-container">
              <Outlet />
            </div>
          </div>
          
          {/* Mobile Overlay Backdrop */}
          {isSidebarOpen && (
            <div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)} />
          )}
        </div>
      </div>

    </div>
  );
}

export default Dashboard;