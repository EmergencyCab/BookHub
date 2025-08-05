//Header.jsx
import { Link, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";

function Header({ onSearch }) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>📚 BookClub Hub</h1>
        </Link>

        {isHomePage && onSearch && <SearchBar onSearch={onSearch} />}

        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/create-post" className="nav-link">
            Write Review
          </Link>
          <Link to="/create-book" className="nav-link">
            Add Book
          </Link>
          <Link to="/reading-lists" className="nav-link">
            Reading Lists
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
