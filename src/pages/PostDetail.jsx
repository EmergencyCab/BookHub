//PostDetail.jsx - Updated with security
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { usePosts } from "../hooks/usePosts";
import CommentSection from "../components/CommentSection";
import { getBookCoverUrl } from "../services/googleBooksAPI";

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { upvotePost } = usePosts();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showSecretPrompt, setShowSecretPrompt] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [action, setAction] = useState(""); // 'edit' or 'delete'
  const [editData, setEditData] = useState({
    title: "",
    content: "",
    rating: "",
  });

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          books (
            id,
            title,
            author,
            genre,
            cover_image_url,
            description,
            publication_date,
            google_books_id
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      setPost(data);
      setEditData({
        title: data.title,
        content: data.content || "",
        rating: data.rating || "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleUpvote = async () => {
    if (!post || isUpvoting) return;

    setIsUpvoting(true);
    try {
      await upvotePost(post.id, post.upvotes);
      setPost((prev) => ({
        ...prev,
        upvotes: prev.upvotes + 1,
      }));
    } catch (err) {
      console.error("Failed to upvote:", err);
    } finally {
      setIsUpvoting(false);
    }
  };

  const requestSecretKey = (actionType) => {
    setAction(actionType);
    setSecretKey("");
    setShowSecretPrompt(true);
  };

  const verifySecretKey = () => {
    if (!secretKey.trim()) {
      alert("Please enter the secret key");
      return;
    }

    if (secretKey.trim() !== post.secret_key) {
      alert(
        "Incorrect secret key! You can only edit/delete posts you created."
      );
      setSecretKey("");
      return;
    }

    // Secret key is correct
    if (action === "edit") {
      setShowEditForm(true);
    } else if (action === "delete") {
      handleDelete();
    }

    setShowSecretPrompt(false);
    setSecretKey("");
  };

  const handleEdit = async (e) => {
    e.preventDefault();

    try {
      const updates = {
        title: editData.title.trim(),
        content: editData.content.trim(),
        updated_at: new Date().toISOString(),
      };

      if (post.type === "review" && editData.rating) {
        updates.rating = parseInt(editData.rating);
      }

      const { error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", post.id);

      if (error) throw error;

      setPost((prev) => ({ ...prev, ...updates }));
      setShowEditForm(false);
    } catch (err) {
      setError("Failed to update post: " + err.message);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase.from("posts").delete().eq("id", post.id);

      if (error) throw error;
      navigate("/");
    } catch (err) {
      setError("Failed to delete post: " + err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating) => {
    if (!rating) return null;

    return (
      <div className="stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? "filled" : "empty"}`}
          >
            ⭐
          </span>
        ))}
        <span className="rating-text">({rating}/5)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="post-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="post-detail-page">
        <div className="error-container">
          <h2>Post not found</h2>
          <p>{error || "The post you are looking for does not exist."}</p>
          <Link to="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-page">
      <div className="post-detail-container">
        {/* Navigation */}
        <div className="post-navigation">
          <Link to="/" className="back-btn">
            ← Back to Posts
          </Link>
        </div>

        {/* Secret Key Prompt Modal */}
        {showSecretPrompt && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>🔐 Enter Secret Key</h3>
              <p>You need the secret key to {action} this post.</p>
              <input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter secret key..."
                className="secret-input"
                onKeyPress={(e) => e.key === "Enter" && verifySecretKey()}
              />
              <div className="modal-actions">
                <button
                  onClick={() => setShowSecretPrompt(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={verifySecretKey} className="btn-primary">
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Post Header */}
        <header className="post-header">
          <div className="post-meta">
            <span className={`post-type-badge ${post.type}`}>
              {post.type === "review" ? "📖 Review" : "💬 Discussion"}
            </span>
            <span className="post-date">
              Posted {formatDate(post.created_at)}
            </span>
            {post.updated_at !== post.created_at && (
              <span className="post-updated">
                (Updated {formatDate(post.updated_at)})
              </span>
            )}
          </div>

          <div className="post-actions">
            <button
              onClick={handleUpvote}
              disabled={isUpvoting}
              className="upvote-btn"
            >
              👍 {post.upvotes || 0}
            </button>
            <button
              onClick={() => requestSecretKey("edit")}
              className="edit-btn"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => requestSecretKey("delete")}
              className="delete-btn"
            >
              🗑️ Delete
            </button>
          </div>
        </header>

        {/* Book Information (for reviews) */}
        {post.type === "review" && post.books && (
          <div className="book-section">
            <h3>Book Details</h3>
            <div className="book-info-detailed">
              <img
                src={getBookCoverUrl(post.books)}
                alt={post.books.title}
                className="book-cover-large"
                onError={(e) => {
                  e.target.src = `https://via.placeholder.com/150x225/e3e3e3/666666?text=Book`;
                }}
              />
              <div className="book-details">
                <h4>{post.books.title}</h4>
                <p className="book-author">by {post.books.author}</p>
                {post.books.genre && (
                  <p className="book-genre">Genre: {post.books.genre}</p>
                )}
                {post.books.publication_date && (
                  <p className="book-year">
                    Published:{" "}
                    {new Date(post.books.publication_date).getFullYear()}
                  </p>
                )}
                {post.books.description && (
                  <p className="book-description">
                    {post.books.description.substring(0, 300)}
                    {post.books.description.length > 300 ? "..." : ""}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Post Content */}
        <article className="post-content">
          {showEditForm ? (
            <form onSubmit={handleEdit} className="edit-form">
              <div className="form-group">
                <label htmlFor="edit-title">Title</label>
                <input
                  type="text"
                  id="edit-title"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>

              {post.type === "review" && (
                <div className="form-group">
                  <label>Rating</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${
                          editData.rating >= star ? "active" : ""
                        }`}
                        onClick={() =>
                          setEditData((prev) => ({ ...prev, rating: star }))
                        }
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="edit-content">Content</label>
                <textarea
                  id="edit-content"
                  value={editData.content}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows="10"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="post-title">{post.title}</h1>

              {post.type === "review" && post.rating && (
                <div className="post-rating">{renderStars(post.rating)}</div>
              )}

              {post.content && (
                <div className="post-body">
                  {post.content.split("\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}

              <div className="post-author-info">
                <span className="author-label">Written by:</span>
                <span className="author-name">{post.author_name}</span>
              </div>
            </>
          )}
        </article>

        {/* Comments Section */}
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}

export default PostDetail;
