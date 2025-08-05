//ReadingLists.jsx
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useBooks } from "../hooks/useBooks";
import BookSearch from "../components/BookSearch";
import { getBookCoverUrl } from "../services/googleBooksAPI";

function ReadingLists() {
  const [readingLists, setReadingLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { findOrCreateBook } = useBooks();

  const [newList, setNewList] = useState({
    name: "",
    description: "",
    author_name: "",
  });
  const [isCreatingList, setIsCreatingList] = useState(false);

  const fetchReadingLists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("reading_lists")
        .select(
          `
          *,
          reading_list_items (
            id,
            books (
              id,
              title,
              author,
              cover_image_url
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReadingLists(data || []);
    } catch (err) {
      setError("Failed to load reading lists");
      console.error("Error fetching reading lists:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadingLists();
  }, []);

  const handleCreateList = async (e) => {
    e.preventDefault();

    if (!newList.name.trim() || !newList.author_name.trim()) {
      setError("Please fill in the required fields");
      return;
    }

    setIsCreatingList(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("reading_lists")
        .insert([
          {
            name: newList.name.trim(),
            description: newList.description.trim() || null,
            author_name: newList.author_name.trim(),
          },
        ])
        .select();

      if (error) throw error;

      setReadingLists((prev) => [data[0], ...prev]);
      setNewList({ name: "", description: "", author_name: "" });
    } catch (err) {
      setError("Failed to create reading list: " + err.message);
    } finally {
      setIsCreatingList(false);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm("Are you sure you want to delete this reading list?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("reading_lists")
        .delete()
        .eq("id", listId);

      if (error) throw error;

      setReadingLists((prev) => prev.filter((list) => list.id !== listId));
    } catch (err) {
      setError("Failed to delete reading list: " + err.message);
    }
  };

  const handleAddBookToList = async (listId, googleBook) => {
    try {
      // First, ensure the book exists in our database
      const book = await findOrCreateBook(googleBook);

      // Check if book is already in the list
      const { data: existing } = await supabase
        .from("reading_list_items")
        .select("id")
        .eq("reading_list_id", listId)
        .eq("book_id", book.id);

      if (existing && existing.length > 0) {
        alert("This book is already in the reading list!");
        return;
      }

      // Add book to the reading list
      const { error } = await supabase.from("reading_list_items").insert([
        {
          reading_list_id: listId,
          book_id: book.id,
        },
      ]);

      if (error) throw error;

      // Refresh the lists to show the new book
      fetchReadingLists();
    } catch (err) {
      setError("Failed to add book to list: " + err.message);
    }
  };

  const handleRemoveBookFromList = async (listId, bookId) => {
    try {
      const { error } = await supabase
        .from("reading_list_items")
        .delete()
        .eq("reading_list_id", listId)
        .eq("book_id", bookId);

      if (error) throw error;

      // Update the local state
      setReadingLists((prev) =>
        prev.map((list) => {
          if (list.id === listId) {
            return {
              ...list,
              reading_list_items: list.reading_list_items.filter(
                (item) => item.books.id !== bookId
              ),
            };
          }
          return list;
        })
      );
    } catch (err) {
      setError("Failed to remove book from list: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="reading-lists-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading reading lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reading-lists-page">
      <div className="reading-lists-header">
        <h1>📚 Reading Lists</h1>
        <p>Organize your books into custom reading lists</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Create New Reading List */}
      <div className="create-list-section">
        <h2>Create New Reading List</h2>
        <form onSubmit={handleCreateList} className="create-list-form">
          <div className="form-group">
            <label htmlFor="list-name">List Name *</label>
            <input
              type="text"
              id="list-name"
              value={newList.name}
              onChange={(e) =>
                setNewList((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="e.g., Summer Reading, Sci-Fi Favorites"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="list-description">Description</label>
            <input
              type="text"
              id="list-description"
              value={newList.description}
              onChange={(e) =>
                setNewList((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Optional description"
            />
          </div>

          <div className="form-group">
            <label htmlFor="list-author">Your Name *</label>
            <input
              type="text"
              id="list-author"
              value={newList.author_name}
              onChange={(e) =>
                setNewList((prev) => ({ ...prev, author_name: e.target.value }))
              }
              placeholder="Your name"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isCreatingList}
          >
            {isCreatingList ? "Creating..." : "Create List"}
          </button>
        </form>
      </div>

      {/* Reading Lists Grid */}
      {readingLists.length === 0 ? (
        <div className="empty-list">
          <h3>No reading lists yet</h3>
          <p>Create your first reading list to start organizing your books!</p>
        </div>
      ) : (
        <div className="lists-grid">
          {readingLists.map((list) => (
            <ReadingListCard
              key={list.id}
              list={list}
              onDeleteList={handleDeleteList}
              onAddBook={handleAddBookToList}
              onRemoveBook={handleRemoveBookFromList}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Reading List Card Component
function ReadingListCard({ list, onDeleteList, onAddBook, onRemoveBook }) {
  const [showAddBook, setShowAddBook] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleAddBook = () => {
    if (selectedBook) {
      onAddBook(list.id, selectedBook);
      setSelectedBook(null);
      setShowAddBook(false);
    }
  };

  return (
    <div className="reading-list-card">
      <div className="list-header">
        <div>
          <h3 className="list-title">{list.name}</h3>
          <div className="list-meta">
            By {list.author_name} • {formatDate(list.created_at)} •{" "}
            {list.reading_list_items?.length || 0} books
          </div>
        </div>
        <div className="list-actions">
          <button
            onClick={() => setShowAddBook(!showAddBook)}
            className="btn-small btn-secondary"
          >
            + Add Book
          </button>
          <button
            onClick={() => onDeleteList(list.id)}
            className="btn-small delete-btn"
          >
            🗑️
          </button>
        </div>
      </div>

      {list.description && (
        <p className="list-description">{list.description}</p>
      )}

      {/* Add Book Section */}
      {showAddBook && (
        <div className="add-book-section">
          <BookSearch
            onBookSelect={setSelectedBook}
            selectedBook={selectedBook}
            placeholder="Search for books to add..."
          />
          {selectedBook && (
            <div className="add-book-actions">
              <button onClick={handleAddBook} className="btn-primary btn-small">
                Add to List
              </button>
              <button
                onClick={() => {
                  setSelectedBook(null);
                  setShowAddBook(false);
                }}
                className="btn-secondary btn-small"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Books in List */}
      <div className="list-books">
        <h4>Books ({list.reading_list_items?.length || 0})</h4>
        {list.reading_list_items && list.reading_list_items.length > 0 ? (
          <div className="book-list-items">
            {list.reading_list_items.map((item) => (
              <div key={item.id} className="book-list-item">
                <img
                  src={getBookCoverUrl(item.books)}
                  alt={item.books.title}
                  className="book-list-cover"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/32x48/e3e3e3/666666?text=Book`;
                  }}
                />
                <div className="book-list-info">
                  <div className="book-list-title">{item.books.title}</div>
                  <div className="book-list-author">by {item.books.author}</div>
                </div>
                <button
                  onClick={() => onRemoveBook(list.id, item.books.id)}
                  className="remove-book-btn"
                  title="Remove from list"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-list-message">No books added yet</p>
        )}
      </div>
    </div>
  );
}

export default ReadingLists;
