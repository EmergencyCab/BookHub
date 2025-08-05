//usePosts.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function usePosts(sortBy = "created_at", searchTerm = "") {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase.from("posts").select(`
          *,
          books (
            title,
            author,
            cover_image_url
          )
        `);

      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      if (sortBy === "upvotes") {
        query = query.order("upvotes", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sortBy, searchTerm]);

  const createPost = async (postData) => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .insert([postData])
        .select();

      if (error) throw error;
      fetchPosts(); // Refresh the list
      return data[0];
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const updatePost = async (id, updates) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ ...updates, updated_at: new Date() })
        .eq("id", id);

      if (error) throw error;
      fetchPosts();
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const deletePost = async (id) => {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) throw error;
      fetchPosts();
    } catch (err) {
      throw new Error(err.message);
    }
  };

  const upvotePost = async (id, currentUpvotes) => {
    try {
      const { error } = await supabase
        .from("posts")
        .update({ upvotes: currentUpvotes + 1 })
        .eq("id", id);

      if (error) throw error;
      fetchPosts();
    } catch (err) {
      throw new Error(err.message);
    }
  };

  return {
    posts,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    upvotePost,
    refetch: fetchPosts,
  };
}
