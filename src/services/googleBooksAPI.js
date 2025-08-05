// src/services/googleBooksAPI.js - Fixed 

const GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export class GoogleBooksAPI {
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

  static formatBookResults(items) {
    return items.map((item) => this.formatSingleBook(item));
  }

  // FIXED: Better date handling
  static formatSingleBook(item) {
    const volumeInfo = item.volumeInfo || {};
    const imageLinks = volumeInfo.imageLinks || {};

    return {
      googleBooksId: item.id,
      title: volumeInfo.title || "Unknown Title",
      authors: volumeInfo.authors || ["Unknown Author"],
      author: (volumeInfo.authors || ["Unknown Author"]).join(", "),
      description: volumeInfo.description || "No description available",
      publishedDate: this.formatPublishedDate(volumeInfo.publishedDate), // FIXED
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
      // For database compatibility
      publication_date: this.formatPublishedDate(volumeInfo.publishedDate), // FIXED
    };
  }

  // NEW: Handle partial dates from Google Books
  static formatPublishedDate(dateString) {
    if (!dateString) return null;

    // If it's just a year (like "2017"), convert to full date
    if (/^\d{4}$/.test(dateString)) {
      return `${dateString}-01-01`;
    }

    // If it's year-month (like "2017-03"), add day
    if (/^\d{4}-\d{2}$/.test(dateString)) {
      return `${dateString}-01`;
    }

    // If it's already a full date or other format, return as-is
    return dateString;
  }

  static extractISBN(identifiers, type) {
    if (!identifiers) return null;

    const identifier = identifiers.find((id) => id.type === type);
    return identifier ? identifier.identifier : null;
  }

  static async getSimilarBooks(bookTitle, author = "") {
    try {
      let query = bookTitle;
      if (author) {
        query += ` ${author}`;
      }

      const books = await this.searchBooks(query, 10);

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

export default GoogleBooksAPI;
