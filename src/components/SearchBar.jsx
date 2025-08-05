// src/components/SearchBar.jsx
import { useState } from "react";

function SearchBar({ onSearch, placeholder = "Search posts..." }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Debounce search - trigger search after user stops typing for 500ms
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      onSearch(value);
    }, 500);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="search-bar">
      <div className="search-input-container">
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          placeholder={placeholder}
          className="search-input"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={clearSearch}
            className="clear-search-btn"
          >
            ✕
          </button>
        )}
        <button type="submit" className="search-btn">
          🔍
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
