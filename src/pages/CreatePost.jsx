// src/pages/CreatePost.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BookSearch from "../components/BookSearch";
import { usePosts } from "../hooks/usePosts";
import { useBooks } from "../hooks/useBooks";

function CreatePost() {
  const navigate = useNavigate();
  const { createPost } = usePosts();
  const { findOrCreateBook } = useBooks();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "review",
    rating: "",
    author_name: "",
  });
  const [selectedBook, setSelectedBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.author_name.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.type === "review" && !selectedBook) {
      setError("Please select a book for your review");
      return;
    }

    if (
      formData.type === "review" &&
      (!formData.rating || formData.rating < 1 || formData.rating > 5)
    ) {
      setError("Please provide a rating between 1 and 5 stars");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let bookId = null;

      if (selectedBook) {
        // Create or find the book in our database
        const book = await findOrCreateBook(selectedBook);
        bookId = book.id;
      }

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
        book_id: bookId,
        rating: formData.type === "review" ? parseInt(formData.rating) : null,
        author_name: formData.author_name.trim(),
      };

      const newPost = await createPost(postData);
      navigate(`/post/${newPost.id}`);
    } catch (err) {
      setError(err.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <h1>
          {formData.type === "review"
            ? "Write a Book Review"
            : "Start a Discussion"}
        </h1>

        <form onSubmit={handleSubmit} className="create-post-form">
          {error && <div className="error-message">{error}</div>}

          {/* Post Type Selection */}
          <div className="form-group">
            <label>Post Type</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="type"
                  value="review"
                  checked={formData.type === "review"}
                  onChange={handleInputChange}
                />
                Book Review
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="type"
                  value="discussion"
                  checked={formData.type === "discussion"}
                  onChange={handleInputChange}
                />
                General Discussion
              </label>
            </div>
          </div>

          {/* Book Selection (only for reviews) */}
          {formData.type === "review" && (
            <div className="form-group">
              <label>Select Book *</label>
              <BookSearch
                onBookSelect={setSelectedBook}
                selectedBook={selectedBook}
                placeholder="Search for the book you want to review..."
              />
            </div>
          )}

          {/* Rating (only for reviews) */}
          {formData.type === "review" && (
            <div className="form-group">
              <label htmlFor="rating">Your Rating *</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${
                      formData.rating >= star ? "active" : ""
                    }`}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, rating: star }))
                    }
                  >
                    ⭐
                  </button>
                ))}
                <span className="rating-text">
                  {formData.rating
                    ? `${formData.rating} star${formData.rating > 1 ? "s" : ""}`
                    : "Click to rate"}
                </span>
              </div>
            </div>
          )}

          {/* Post Title */}
          <div className="form-group">
            <label htmlFor="title">
              {formData.type === "review"
                ? "Review Title *"
                : "Discussion Title *"}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={
                formData.type === "review"
                  ? "e.g., 'A masterpiece of storytelling'"
                  : "e.g., 'What are your thoughts on fantasy vs sci-fi?'"
              }
              required
            />
          </div>

          {/* Post Content */}
          <div className="form-group">
            <label htmlFor="content">
              {formData.type === "review"
                ? "Your Review"
                : "Discussion Content"}
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows="8"
              placeholder={
                formData.type === "review"
                  ? "Share your thoughts about the book. What did you like? What didn't work for you? Would you recommend it to others?"
                  : "Share your thoughts and start a conversation with the community..."
              }
            />
          </div>

          {/* Author Name */}
          <div className="form-group">
            <label htmlFor="author_name">Your Name *</label>
            <input
              type="text"
              id="author_name"
              name="author_name"
              value={formData.author_name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Publishing..."
                : `Publish ${
                    formData.type === "review" ? "Review" : "Discussion"
                  }`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
