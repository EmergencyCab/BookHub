const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export class GoogleBooksAPI {
  /**
   * Search for books using Google Books API
   * @param {string} query - Search query (title, author, ISBN, etc.)
   * @param {number} maxResults - Maximum number of results (default: 20)
   * @returns {Promise<Array>} - Array of book objects
   */
  static async searchBooks(query, maxResults = 20) {
    try {
      const url = `${GOOGLE_BOOKS_BASE_URL}?q=${encodeURIComponent(
        query
      )}&maxResults=${maxResults}&printType=books`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return this.formatBookResults(data.items || []);
    } catch (error) {
      console.error("Error searching books:", error);
      throw new Error("Failed to search books. Please try again.");
    }
  }

  /**
   * Get detailed information about a specific book
   * @param {string} bookId - Google Books volume ID
   * @returns {Promise<Object>} - Detailed book object
   */
  static async getBookDetails(bookId) {
    try {
      const url = `${GOOGLE_BOOKS_BASE_URL}/${bookId}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return this.formatSingleBook(data);
    } catch (error) {
      console.error("Error fetching book details:", error);
      throw new Error("Failed to fetch book details. Please try again.");
    }
  }

  /**
   * Search books by specific criteria
   * @param {Object} criteria - Search criteria object
   * @returns {Promise<Array>} - Array of book objects
   */
  static async searchByCategory(criteria) {
    const { author, title, subject, isbn } = criteria;
    let query = "";

    if (title) query += `intitle:${title} `;
    if (author) query += `inauthor:${author} `;
    if (subject) query += `subject:${subject} `;
    if (isbn) query += `isbn:${isbn} `;

    return this.searchBooks(query.trim());
  }

  /**
   * Get popular books by category
   * @param {string} category - Book category/genre
   * @param {number} maxResults - Maximum results
   * @returns {Promise<Array>} - Array of book objects
   */
  static async getPopularByCategory(category, maxResults = 20) {
    const query = `subject:${category}&orderBy=relevance`;
    return this.searchBooks(query, maxResults);
  }

  /**
   * Format multiple book results from Google Books API
   * @param {Array} items - Raw items from Google Books API
   * @returns {Array} - Formatted book objects
   */
  static formatBookResults(items) {
    return items.map((item) => this.formatSingleBook(item));
  }

  /**
   * Format a single book from Google Books API
   * @param {Object} item - Raw book item from Google Books API
   * @returns {Object} - Formatted book object
   */
  static formatSingleBook(item) {
    const volumeInfo = item.volumeInfo || {};
    const imageLinks = volumeInfo.imageLinks || {};

    return {
      googleBooksId: item.id,
      title: volumeInfo.title || "Unknown Title",
      authors: volumeInfo.authors || ["Unknown Author"],
      author: (volumeInfo.authors || ["Unknown Author"]).join(", "),
      description: volumeInfo.description || "No description available",
      publishedDate: volumeInfo.publishedDate || null,
      pageCount: volumeInfo.pageCount || null,
      categories: volumeInfo.categories || [],
      genre: (volumeInfo.categories || [])[0] || "Unknown",
      averageRating: volumeInfo.averageRating || null,
      ratingsCount: volumeInfo.ratingsCount || 0,
      language: volumeInfo.language || "en",
      publisher: volumeInfo.publisher || "Unknown Publisher",
      isbn10: this.extractISBN(volumeInfo.industryIdentifiers, "ISBN_10"),
      isbn13: this.extractISBN(volumeInfo.industryIdentifiers, "ISBN_13"),
      thumbnail: imageLinks.thumbnail || imageLinks.smallThumbnail || null,
      smallThumbnail: imageLinks.smallThumbnail || null,
      cover_image_url:
        imageLinks.thumbnail || imageLinks.smallThumbnail || null,
      previewLink: volumeInfo.previewLink || null,
      infoLink: volumeInfo.infoLink || null,
      // Additional fields for our database
      publication_date: volumeInfo.publishedDate || null,
    };
  }

  /**
   * Extract ISBN from industry identifiers
   * @param {Array} identifiers - Industry identifiers array
   * @param {string} type - ISBN type (ISBN_10 or ISBN_13)
   * @returns {string|null} - ISBN or null
   */
  static extractISBN(identifiers, type) {
    if (!identifiers) return null;

    const identifier = identifiers.find((id) => id.type === type);
    return identifier ? identifier.identifier : null;
  }

  /**
   * Get book suggestions based on a book title or author
   * @param {string} bookTitle - Title of the book
   * @param {string} author - Author name (optional)
   * @returns {Promise<Array>} - Array of similar books
   */
  static async getSimilarBooks(bookTitle, author = "") {
    try {
      let query = bookTitle;
      if (author) {
        query += ` ${author}`;
      }

      const books = await this.searchBooks(query, 10);

      // Filter out the exact same book if possible
      return books.filter(
        (book) => book.title.toLowerCase() !== bookTitle.toLowerCase()
      );
    } catch (error) {
      console.error("Error getting similar books:", error);
      return [];
    }
  }
}

// Helper function to get book cover URL with fallback
export function getBookCoverUrl(book, size = "thumbnail") {
  if (book.cover_image_url) return book.cover_image_url;
  if (book.thumbnail) return book.thumbnail;
  if (book.smallThumbnail) return book.smallThumbnail;

  // Fallback to a placeholder image
  return `https://via.placeholder.com/128x196/e3e3e3/666666?text=${encodeURIComponent(
    book.title.substring(0, 20)
  )}`;
}

// Export default
export default GoogleBooksAPI;
