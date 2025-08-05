// src/hooks/useBooks.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import GoogleBooksAPI from "../services/googleBooksAPI";

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const createBookFromGoogleBooks = async (googleBook) => {
    try {
      // Check if book already exists in our database
      const { data: existingBooks } = await supabase
        .from("books")
        .select("id")
        .eq("google_books_id", googleBook.googleBooksId);

      if (existingBooks && existingBooks.length > 0) {
        return existingBooks[0];
      }

      // Create new book from Google Books data
      const bookData = {
        title: googleBook.title,
        author: googleBook.author,
        genre: googleBook.genre,
        publication_date: googleBook.publishedDate || null,
        description: googleBook.description,
        cover_image_url: googleBook.cover_image_url,
        google_books_id: googleBook.googleBooksId,
        isbn10: googleBook.isbn10,
        isbn13: googleBook.isbn13,
        page_count: googleBook.pageCount,
        publisher: googleBook.publisher,
        google_rating: googleBook.averageRating,
        google_ratings_count: googleBook.ratingsCount,
      };

      const { data, error } = await supabase
        .from("books")
        .insert([bookData])
        .select();

      if (error) throw error;
      fetchBooks();
      return data[0];
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const createBook = async (bookData) => {
    try {
      const { data, error } = await supabase
        .from("books")
        .insert([bookData])
        .select();

      if (error) throw error;
      fetchBooks();
      return data[0];
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const findOrCreateBook = async (googleBook) => {
    try {
      // First check if we already have this book in our database
      const { data: existingBooks } = await supabase
        .from("books")
        .select("*")
        .eq("google_books_id", googleBook.googleBooksId);

      if (existingBooks && existingBooks.length > 0) {
        return existingBooks[0];
      }

      // If not found, create it
      return await createBookFromGoogleBooks(googleBook);
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const getBookById = async (bookId) => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const searchBooks = async (query) => {
    try {
      // Search in our local database first
      const { data: localBooks, error } = await supabase
        .from("books")
        .select("*")
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      // Also search Google Books for additional results
      const googleBooks = await GoogleBooksAPI.searchBooks(query, 5);

      // Combine results, prioritizing local books
      const combinedResults = [
        ...localBooks,
        ...googleBooks.filter(
          (googleBook) =>
            !localBooks.some(
              (localBook) =>
                localBook.google_books_id === googleBook.googleBooksId
            )
        ),
      ];

      return combinedResults;
    } catch (err) {
      console.error("Error searching books:", err);
      return [];
    }
  };

  return {
    books,
    loading,
    error,
    createBook,
    createBookFromGoogleBooks,
    findOrCreateBook,
    getBookById,
    searchBooks,
    refetch: fetchBooks,
  };
}
