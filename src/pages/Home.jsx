// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import PostCard from "../components/PostCard";
import SearchBar from "../components/SearchBar";

function Home({ searchTerm: externalSearchTerm = "" }) {
  const [sortBy, setSortBy] = useState("created_at");
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm);
  const [filterType, setFilterType] = useState("all");

  const { posts, loading, error } = usePosts(sortBy, searchTerm);

  // Update local search term when external search term changes
  useEffect(() => {
    setSearchTerm(externalSearchTerm);
  }, [externalSearchTerm]);

  const filteredPosts = posts.filter((post) => {
    if (filterType === "all") return true;
    return post.type === filterType;
  });

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4)
      return `${diffInWeeks} week${diffInWeeks > 1 ? "s" : ""} ago`;

    return postDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="error-container">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="welcome-section">
          <h1>Welcome to BookClub Hub</h1>
          <p>
            Discover, discuss, and share your love for books with fellow readers
          </p>
        </div>

        <div className="quick-actions">
          <Link to="/create-post" className="btn-primary">
            Write a Review
          </Link>
          <Link to="/create-book" className="btn-secondary">
            Add a Book
          </Link>
        </div>
      </div>

      <div className="content-controls">
        <div className="search-section">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search posts by title..."
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Filter by type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Posts</option>
              <option value="review">Reviews Only</option>
              <option value="discussion">Discussions Only</option>
            </select>
          </div>

          <div className="sort-group">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="created_at">Most Recent</option>
              <option value="upvotes">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="posts-section">
        {searchTerm && (
          <div className="search-results-header">
            <p>
              {filteredPosts.length} result
              {filteredPosts.length !== 1 ? "s" : ""}
              for "{searchTerm}"
            </p>
          </div>
        )}

        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            {searchTerm ? (
              <div>
                <h3>No posts found</h3>
                <p>Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div>
                <h3>No posts yet</h3>
                <p>
                  Be the first to share a book review or start a discussion!
                </p>
                <Link to="/create-post" className="btn-primary">
                  Create First Post
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                formatTimeAgo={formatTimeAgo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
