// src/hooks/useFetchPage.js
import { useState, useEffect } from "react";
import { fetchPageBySlug } from "../../src/services/viewBySlug";

const useFetchPage = (slug) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetchPageBySlug(slug);
        if (response.success) {
          setContent(response.data?.richText || "");
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.message || "Error fetching content");
      } finally {
      }
    };

    fetchContent();
  }, [slug]);

  return { content,  error };
};

export default useFetchPage;
