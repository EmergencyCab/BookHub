//CreateBook.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useBooks } from "../hooks/useBooks";

function CreateBook() {
  const navigate = useNavigate();
  const { createBook } = useBooks();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    publication_date: "",
    description: "",
    cover_image_url: "",
    isbn10: "",
    isbn13: "",
    page_count: "",
    publisher: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Book title is required");
      return false;
    }

    if (!formData.author.trim()) {
      setError("Author name is required");
      return false;
    }

    // Validate ISBN if provided
    if (formData.isbn10 && formData.isbn10.length !== 10) {
      setError("ISBN-10 must be exactly 10 characters");
      return false;
    }

    if (formData.isbn13 && formData.isbn13.length !== 13) {
      setError("ISBN-13 must be exactly 13 characters");
      return false;
    }

    // Validate page count if provided
    if (
      formData.page_count &&
      (isNaN(formData.page_count) || parseInt(formData.page_count) < 1)
    ) {
      setError("Page count must be a positive number");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const bookData = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        genre: formData.genre.trim() || null,
        publication_date: formData.publication_date || null,
        description: formData.description.trim() || null,
        cover_image_url: formData.cover_image_url.trim() || null,
        isbn10: formData.isbn10.trim() || null,
        isbn13: formData.isbn13.trim() || null,
        page_count: formData.page_count ? parseInt(formData.page_count) : null,
        publisher: formData.publisher.trim() || null,
      };

      const newBook = await createBook(bookData);
      setSuccess(true);

      // Reset form
      setFormData({
        title: "",
        author: "",
        genre: "",
        publication_date: "",
        description: "",
        cover_image_url: "",
        isbn10: "",
        isbn13: "",
        page_count: "",
        publisher: "",
      });

      // Show success message and redirect after a delay
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create book");
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonGenres = [
    "Fiction",
    "Non-Fiction",
    "Mystery",
    "Science Fiction",
    "Fantasy",
    "Romance",
    "Thriller",
    "Biography",
    "History",
    "Self-Help",
    "Poetry",
    "Drama",
    "Horror",
    "Comedy",
    "Adventure",
    "Young Adult",
    "Children's",
    "Educational",
    "Business",
    "Philosophy",
  ];

  return (
    <div className="create-book-page">
      <div className="create-book-container">
        <div className="page-header">
          <h1>Add a New Book</h1>
          <p>
            Can't find a book in our search? Add it manually to our database.
          </p>
        </div>

        {success && (
          <div className="success-message">
            <h3>✅ Book added successfully!</h3>
            <p>
              The book has been added to our database. Redirecting to home
              page...
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-book-form">
          {error && <div className="error-message">{error}</div>}

          {/* Required Fields */}
          <div className="form-section">
            <h3>Required Information</h3>

            <div className="form-group">
              <label htmlFor="title">Book Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter the book title"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Author *</label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Enter the author's name"
                required
              />
            </div>
          </div>

          {/* Optional Details */}
          <div className="form-section">
            <h3>Additional Details</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="genre">Genre</label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                >
                  <option value="">Select a genre</option>
                  {commonGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="publication_date">Publication Date</label>
                <input
                  type="date"
                  id="publication_date"
                  name="publication_date"
                  value={formData.publication_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Enter a brief description of the book"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cover_image_url">Cover Image URL</label>
              <input
                type="url"
                id="cover_image_url"
                name="cover_image_url"
                value={formData.cover_image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/book-cover.jpg"
              />
              {formData.cover_image_url && (
                <div className="image-preview">
                  <img
                    src={formData.cover_image_url}
                    alt="Book cover preview"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Publishing Details */}
          <div className="form-section">
            <h3>Publishing Information</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="publisher">Publisher</label>
                <input
                  type="text"
                  id="publisher"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleInputChange}
                  placeholder="Publisher name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="page_count">Page Count</label>
                <input
                  type="number"
                  id="page_count"
                  name="page_count"
                  value={formData.page_count}
                  onChange={handleInputChange}
                  placeholder="Number of pages"
                  min="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="isbn10">ISBN-10</label>
                <input
                  type="text"
                  id="isbn10"
                  name="isbn10"
                  value={formData.isbn10}
                  onChange={handleInputChange}
                  placeholder="10-digit ISBN"
                  maxLength="10"
                />
              </div>

              <div className="form-group">
                <label htmlFor="isbn13">ISBN-13</label>
                <input
                  type="text"
                  id="isbn13"
                  name="isbn13"
                  value={formData.isbn13}
                  onChange={handleInputChange}
                  placeholder="13-digit ISBN"
                  maxLength="13"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <Link to="/" className="btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding Book..." : "Add Book"}
            </button>
          </div>
        </form>

        <div className="help-section">
          <h3>💡 Tips for Adding Books</h3>
          <ul>
            <li>
              <strong>Search first:</strong> Before adding manually, try
              searching for the book using our Google Books integration
            </li>
            <li>
              <strong>Cover images:</strong> Find book covers on sites like
              Amazon or Goodreads, then copy the image URL
            </li>
            <li>
              <strong>ISBN:</strong> You can usually find ISBN numbers on the
              book's copyright page or back cover
            </li>
            <li>
              <strong>Genres:</strong> Choose the most appropriate genre from
              the dropdown, or leave blank if unsure
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CreateBook;
