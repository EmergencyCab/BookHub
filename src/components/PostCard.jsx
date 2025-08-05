//PostCard.jsx
import { Link } from "react-router-dom";
import { getBookCoverUrl } from "../services/googleBooksAPI";

function PostCard({ post, formatTimeAgo }) {
  const renderStars = (rating) => {
    if (!rating) return null;

    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? "filled" : "empty"}`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  const getPostTypeLabel = (type) => {
    return type === "review" ? "📖 Review" : "💬 Discussion";
  };

  const getPostTypeClass = (type) => {
    return type === "review" ? "post-type-review" : "post-type-discussion";
  };

  return (
    <article className={`post-card ${getPostTypeClass(post.type)}`}>
      <div className="post-header">
        <span className="post-type">{getPostTypeLabel(post.type)}</span>
        <span className="post-time">{formatTimeAgo(post.created_at)}</span>
      </div>

      {/* Book info for reviews */}
      {post.type === "review" && post.books && (
        <div className="book-info">
          <img
            src={getBookCoverUrl(post.books)}
            alt={post.books.title}
            className="book-cover-small"
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/40x60/e3e3e3/666666?text=Book`;
            }}
          />
          <div className="book-details">
            <h4 className="book-title">{post.books.title}</h4>
            <p className="book-author">by {post.books.author}</p>
          </div>
        </div>
      )}

      <Link to={`/post/${post.id}`} className="post-link">
        <h3 className="post-title">{post.title}</h3>
      </Link>

      {/* Rating for reviews */}
      {post.type === "review" && post.rating && (
        <div className="post-rating">
          {renderStars(post.rating)}
          <span className="rating-text">{post.rating}/5</span>
        </div>
      )}

      {/* Content preview */}
      {post.content && (
        <p className="post-content-preview">
          {post.content.length > 150
            ? `${post.content.substring(0, 150)}...`
            : post.content}
        </p>
      )}

      <div className="post-footer">
        <div className="post-author">
          <span className="author-icon">👤</span>
          <span className="author-name">{post.author_name}</span>
        </div>

        <div className="post-stats">
          <div className="upvotes">
            <span className="upvote-icon">👍</span>
            <span className="upvote-count">{post.upvotes || 0}</span>
          </div>
        </div>
      </div>

      <Link to={`/post/${post.id}`} className="read-more-btn">
        Read More →
      </Link>
    </article>
  );
}

export default PostCard;
