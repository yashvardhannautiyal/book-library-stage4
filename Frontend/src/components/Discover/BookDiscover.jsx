import React, { useEffect, useState, useRef } from "react";

function BookDiscover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  //used to avoid previous searchQuery to show result when the current searchQuery result is shown
  //cancel the old request
  const abortControllerRef = useRef(null);

  const searchBooks = async (query) => {
    // Cancel the previous request if it still exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a controller for the new request
    const controller = new AbortController();

    // Store this controller
    abortControllerRef.current = controller;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(
          query,
        )}&page=1`,
        {
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch books. Status: ${response.status}`);
      }

      const data = await response.json();

      setResult(data.docs || []);
    } catch (err) {
      // Abort is expected when a newer search starts
      if (err.name === "AbortError") {
        return;
      }

      console.error("Failed to fetch books:", err);

      setError(
        err.message || "Something went wrong while searching for books.",
      );
    } finally {
      // Only change loading if this request is still the current one
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!searchQuery.trim()) {
        setResult([]);
        setError("");

        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        setLoading(false);
        return;
      }

      searchBooks(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div>
      <h2>Discover Books</h2>

      <input
        type="text"
        placeholder="Search for a book or author"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* loading  */}
      {loading && <p>Searching for books</p>}

      {/* if user enters invalid book */}
      {!loading && !error && searchQuery.trim() && result.length === 0 && (
        <p>
          No books found for "{searchQuery}". Try another title, author, or
          keyword.
        </p>
      )}

      {/* Error */}
      {!loading && error && (
        <div>
          <p>{error}</p>

          <button onClick={() => searchBooks(searchQuery)}>Retry</button>
        </div>
      )}

      {/* not loading  */}
      {!loading &&
        result.map((book) => (
          <div key={book.key}>
            <h3>{book.title}</h3>

            <p>Author : {book.author_name?.join(", ") || "Unknown author"}</p>

            <p>First published : {book.first_publish_year || "Unkown"}</p>
          </div>
        ))}
    </div>
  );
}

export default BookDiscover;
