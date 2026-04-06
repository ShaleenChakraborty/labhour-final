import "./Sidebar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Home, Info, Layout, Mail, User, LogOut } from "lucide-react";

function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => {
    navigate(path);
    if (onClose) onClose();
  };

  return (
    <div className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h2 className="logo-text">LabHour</h2>
        <button className="close-sidebar" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <ul>

        {/* HOME */}
        <li
          className={isActive("/dashboard") ? "active" : ""}
          onClick={() => handleNav("/dashboard")}
        >
          <Home size={18} />
          <span>Home</span>
        </li>

        {/* ABOUT */}
        <li
          className={isActive("/dashboard/about") ? "active" : ""}
          onClick={() => handleNav("/dashboard/about")}
        >
          <Info size={18} />
          <span>About Us</span>
        </li>

        {/* UTILITY */}
        <li
          className={isActive("/dashboard/utility") ? "active" : ""}
          onClick={() => handleNav("/dashboard/utility")}
        >
          <Layout size={18} />
          <span>Utility &amp; Design</span>
        </li>

        {/* CONTACT */}
        <li
          className={isActive("/dashboard/contact") ? "active" : ""}
          onClick={() => handleNav("/dashboard/contact")}
        >
          <Mail size={18} />
          <span>Contact Us</span>
        </li>

      </ul>

      {/* PROFILE */}
      <div className="profile-section">
        <button
          className={isActive("/dashboard/profile") ? "profile-btn active" : "profile-btn"}
          onClick={() => handleNav("/dashboard/profile")}
        >
          <User size={18} />
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;