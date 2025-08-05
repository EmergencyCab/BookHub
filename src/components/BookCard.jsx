// src/components/BookCard.jsx
import { Link } from "react-router-dom";
import { getBookCoverUrl } from "../services/googleBooksAPI";

function BookCard({ book, showAddToList = false, onAddToList = null }) {
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).getFullYear();
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="book-card">
      <div className="book-cover-container">
        <img
          src={getBookCoverUrl(book)}
          alt={book.title}
          className="book-cover"
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/120x180/e3e3e3/666666?text=${encodeURIComponent(
              book.title.substring(0, 20)
            )}`;
          }}
        />
      </div>

      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>

        {book.genre && book.genre !== "Unknown" && (
          <p className="book-genre">{book.genre}</p>
        )}

        <div className="book-meta">
          {book.publication_date && (
            <span className="book-year">
              Published: {formatDate(book.publication_date)}
            </span>
          )}
          {book.page_count && (
            <span className="book-pages">{book.page_count} pages</span>
          )}
        </div>

        {book.description && (
          <p className="book-description">
            {truncateText(book.description, 120)}
          </p>
        )}

        {book.google_rating && (
          <div className="book-rating">
            <span className="rating-stars">
              {"⭐".repeat(Math.round(book.google_rating))}
            </span>
            <span className="rating-text">
              {book.google_rating}/5 ({book.google_ratings_count || 0} reviews)
            </span>
          </div>
        )}

        <div className="book-actions">
          {book.id && (
            <Link
              to={`/create-post?bookId=${book.id}`}
              className="btn-primary btn-small"
            >
              Write Review
            </Link>
          )}

          {showAddToList && onAddToList && (
            <button
              onClick={() => onAddToList(book)}
              className="btn-secondary btn-small"
            >
              Add to List
            </button>
          )}

          {book.previewLink && (
            <a
              href={book.previewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-small"
            >
              Preview
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookCard;
