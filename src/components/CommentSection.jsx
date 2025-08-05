//CommentSection.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState({
    content: "",
    author_name: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      setError("Failed to load comments");
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.content.trim() || !newComment.author_name.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            post_id: postId,
            content: newComment.content.trim(),
            author_name: newComment.author_name.trim(),
          },
        ])
        .select();

      if (error) throw error;

      // Add new comment to the list
      setComments((prev) => [...prev, ...data]);

      // Clear form
      setNewComment({ content: "", author_name: "" });
    } catch (err) {
      setError("Failed to post comment: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      // Remove comment from the list
      setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    } catch (err) {
      setError("Failed to delete comment: " + err.message);
    }
  };

  const formatCommentDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  return (
    <section className="comments-section">
      <div className="comments-header">
        <h3>Discussion ({comments.length})</h3>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Add New Comment Form */}
      <form onSubmit={handleSubmitComment} className="comment-form">
        <h4>Join the conversation</h4>

        <div className="comment-form-group">
          <label htmlFor="comment-author">Your Name</label>
          <input
            type="text"
            id="comment-author"
            value={newComment.author_name}
            onChange={(e) =>
              setNewComment((prev) => ({
                ...prev,
                author_name: e.target.value,
              }))
            }
            placeholder="Enter your name"
            required
          />
        </div>

        <div className="comment-form-group">
          <label htmlFor="comment-content">Your Comment</label>
          <textarea
            id="comment-content"
            value={newComment.content}
            onChange={(e) =>
              setNewComment((prev) => ({
                ...prev,
                content: e.target.value,
              }))
            }
            placeholder="Share your thoughts..."
            rows="4"
            required
          />
        </div>

        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </button>
      </form>

      {/* Comments List */}
      <div className="comments-list">
        {loading ? (
          <div className="comments-loading">
            <div className="loading-spinner"></div>
            <p>Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="no-comments">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <div className="comment-author">
                  <span className="author-icon">👤</span>
                  <span className="author-name">{comment.author_name}</span>
                </div>
                <div className="comment-meta">
                  <span className="comment-date">
                    {formatCommentDate(comment.created_at)}
                  </span>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="delete-comment-btn"
                    title="Delete comment"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="comment-content">
                {comment.content.split("\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default CommentSection;
