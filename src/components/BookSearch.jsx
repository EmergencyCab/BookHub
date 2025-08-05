//BookSearch.jsx
import { useState, useEffect } from "react";
import GoogleBooksAPI, { getBookCoverUrl } from "../services/googleBooksAPI";

function BookSearch({
  onBookSelect,
  selectedBook = null,
  placeholder = "Search for books...",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const results = await GoogleBooksAPI.searchBooks(query, 10);
      setSearchResults(results);
      setShowResults(true);
    } catch (err) {
      setError("Failed to search books. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Debounce search
    clearTimeout(window.bookSearchTimeout);
    window.bookSearchTimeout = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const handleBookSelect = (book) => {
    onBookSelect(book);
    setSearchQuery(book.title);
    setShowResults(false);
  };

  const clearSelection = () => {
    onBookSelect(null);
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  useEffect(() => {
    if (selectedBook) {
      setSearchQuery(selectedBook.title);
    }
  }, [selectedBook]);

  return (
    <div className="book-search">
      <div className="search-input-container">
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="book-search-input"
        />
        {selectedBook && (
          <button
            type="button"
            onClick={clearSelection}
            className="clear-selection-btn"
          >
            ✕
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {isSearching && <div className="loading-message">Searching books...</div>}

      {showResults && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((book) => (
            <div
              key={book.googleBooksId}
              className="search-result-item"
              onClick={() => handleBookSelect(book)}
            >
              <img
                src={getBookCoverUrl(book)}
                alt={book.title}
                className="result-book-cover"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/64x96/e3e3e3/666666?text=Book`;
                }}
              />
              <div className="result-book-info">
                <h4 className="result-book-title">{book.title}</h4>
                <p className="result-book-author">by {book.author}</p>
                {book.publishedDate && (
                  <p className="result-book-year">
                    Published: {new Date(book.publishedDate).getFullYear()}
                  </p>
                )}
                {book.genre && book.genre !== "Unknown" && (
                  <p className="result-book-genre">Genre: {book.genre}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults &&
        searchResults.length === 0 &&
        !isSearching &&
        searchQuery && (
          <div className="no-results">
            No books found for "{searchQuery}". Try a different search term.
          </div>
        )}

      {selectedBook && (
        <div className="selected-book-preview">
          <h3>Selected Book:</h3>
          <div className="selected-book-card">
            <img
              src={getBookCoverUrl(selectedBook)}
              alt={selectedBook.title}
              className="selected-book-cover"
            />
            <div className="selected-book-details">
              <h4>{selectedBook.title}</h4>
              <p>by {selectedBook.author}</p>
              {selectedBook.genre && <p>Genre: {selectedBook.genre}</p>}
              {selectedBook.publishedDate && (
                <p>
                  Published:{" "}
                  {new Date(selectedBook.publishedDate).getFullYear()}
                </p>
              )}
              {selectedBook.description && (
                <p className="selected-book-description">
                  {selectedBook.description.substring(0, 200)}
                  {selectedBook.description.length > 200 ? "..." : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookSearch;
