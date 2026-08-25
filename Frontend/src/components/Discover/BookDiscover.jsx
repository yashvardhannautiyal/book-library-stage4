import React, { useEffect, useState, useRef } from "react";
import BookCover from "./BookCover";

function BookDiscover() {
  //    ---------------------------------------------------------------------------------------------------
  //STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [selectedBook, setSelectedBook] = useState(null);

  const RESULTS_PER_PAGE = 5;

  const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);

  //    ---------------------------------------------------------------------------------------------------
  // USEREF
  //used to avoid previous searchQuery to show result when the current searchQuery result is shown
  //cancel the old request
  const abortControllerRef = useRef(null);

  //    ---------------------------------------------------------------------------------------------------
  //SEARCH BOOK
  const searchBooks = async (query, page = currentPage) => {
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
        )}&page=${page}&limit=${RESULTS_PER_PAGE}`,
        {
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch books. Status: ${response.status}`);
      }

      const data = await response.json();

      setResult(data.docs || []);
      setTotalResults(data.numFound || 0);
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

  //    ---------------------------------------------------------------------------------------------------
  //USE EFFECT
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

      searchBooks(searchQuery, currentPage);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentPage]);

  //    ---------------------------------------------------------------------------------------------------
  //PAGE BUTTONS
  //previous page
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div>
      <h2>Discover Books</h2>

      <input
        type="text"
        placeholder="Search for a book or author"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1);
          setSelectedBook(null);
        }}
      />

      {/* DISPLAY loading  */}
      {loading && <p>Searching for books</p>}

      {/* DISPLAY - if user enters invalid book */}
      {!loading && !error && searchQuery.trim() && result.length === 0 && (
        <p>
          No books found for "{searchQuery}". Try another title, author, or
          keyword.
        </p>
      )}

      {/* DISPLAY Error */}
      {!loading && error && (
        <div>
          <p>{error}</p>

          <button onClick={() => searchBooks(searchQuery, currentPage)}>
            Retry
          </button>
        </div>
      )}

      {/* DISPLAY RESULT  */}
      {!loading &&
        result.map((book) => (
          <div key={book.key}>
            <BookCover coverId={book.cover_i} title={book.title} />
            <h3>{book.title}</h3>

            <p>Author : {book.author_name?.join(", ") || "Unknown author"}</p>

            <p>First published : {book.first_publish_year || "Unkown"}</p>

            <button onClick={() => setSelectedBook(book)}>View details </button>
          </div>
        ))}

      {/* DISPLAY DETAILED INFO  */}
      {selectedBook && (
        <div>
          <h2>{selectedBook.title}</h2>

          <h3>Subjects</h3>

          {selectedBook.subject?.length > 0 ? (
            <p>{selectedBook.subject.slice(0, 10).join(", ")}</p>
          ) : (
            <p>No subjects available.</p>
          )}

          <p>
            <strong>Edition count:</strong>{" "}
            {selectedBook.edition_count || "Unknown"}
          </p>

          <a
            href={`https://openlibrary.org${selectedBook.key}`}
            target="_blank"
            rel="noreferrer"
          >
            View on OpenLibrary
          </a>

          <button onClick={() => setSelectedBook(null)}>Close Details</button>
        </div>
      )}
      {totalResults > 0 && (
        <div>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </button>

          <p>
            Page {currentPage} of {totalPages}
          </p>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || loading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default BookDiscover;
