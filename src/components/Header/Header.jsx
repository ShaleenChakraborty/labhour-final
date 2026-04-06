import { useContext, useState, useEffect } from "react";
import { SearchContext } from "../../context/SearchContext";
import { Menu, X, Search, User } from "lucide-react";
import "./Header.css";
import logo from "../../assets/logo.png";

function Header({ onMenuToggle }) {
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const [username, setUsername] = useState("Research Scientist");

  useEffect(() => {
    // No longer need to fetch from localStorage - standalone mode active
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <Menu size={24} />
        </button>
        <img src={logo} alt="logo" className="header-logo" />
      </div>

      <div className="search-container">
        <Search className="search-icon" size={18} />
        <input
          className="search-input"
          placeholder="Search materials..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className="header-user">
        <span className="username">
          {username}
        </span>
        <div className="user-avatar">
          <User size={18} />
        </div>
      </div>
    </div>
  );
}

export default Header;