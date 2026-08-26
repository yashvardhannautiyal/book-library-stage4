import React, { useEffect, useState, useRef } from "react";
import BookCover from "./BookCover";

function BookDiscover({ shelves, onAddBook }) {
  //    ---------------------------------------------------------------------------------------------------
  //STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [selectedBook, setSelectedBook] = useState(null);

  // detail states
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailData, setDetailData] = useState(null);

  //shelf state
  const [selectedShelfId, setSelectedShelfId] = useState("");

  //    ---------------------------------------------------------------------------------------------------
  // PAGINATION CALCULATION
  const RESULTS_PER_PAGE = 5;

  // total pages in OpenLibrary API
  const totalAvailablePages = Math.ceil(totalResults / RESULTS_PER_PAGE);

  // total pages according to search result
  const totalClientPages = Math.ceil(result.length / RESULTS_PER_PAGE);

  const startIndex = (currentPage - 1) * RESULTS_PER_PAGE;

  const paginatedBooks = result.slice(
    startIndex,
    startIndex + RESULTS_PER_PAGE,
  );

  //    ---------------------------------------------------------------------------------------------------
  // USEREF
  //used to avoid previous searchQuery to show result when the current searchQuery result is shown
  //cancel the old request
  const abortControllerRef = useRef(null);

  //    ---------------------------------------------------------------------------------------------------
  //SEARCH BOOK
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
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`,
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
  // FETCH BOOK DETAILS
  const bookDetails = async (book) => {
    // try block
    try {
      setDetailLoading(true);
      setDetailError("");
      setDetailData(null);

      const response = await fetch(`https://openlibrary.org${book.key}.json`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch book details. Status : ${response.status}`,
        );
      }

      const data = await response.json();

      setDetailData(data);
    } catch (err) {
      // catch block
      console.log("Failed to fetch book details : ", err);

      setDetailError(
        err.message || "Something went wrong while loading book details.",
      );
    } finally {
      // finally block
      setDetailLoading(false);
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

      searchBooks(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
    if (currentPage < totalClientPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  //    ---------------------------------------------------------------------------------------------------
  // ADD BOOK TO LIBRARY
  const handleAddToLibrary = (book) => {
    // convert OpenBookLibrary format -> to -> existing library format
    if (!selectedShelfId) {
      return;
    }

    const importedBooks = {
      id: crypto.randomUUID(),

      title: book.title || "Untitled",

      author: book.author_name?.join(", ") || "Unknown author",

      shelfId: selectedShelfId,

      rating: "",

      coverId: book.cover_i ?? null,
    };

    onAddBook(importedBooks);
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

          <button onClick={() => searchBooks(searchQuery)}>Retry</button>
        </div>
      )}

      {/* DISPLAY RESULT  */}
      {!loading &&
        paginatedBooks.map((book) => (
          <div key={book.key}>
            <BookCover coverId={book.cover_i} title={book.title} />
            <h3>{book.title}</h3>

            <p>Author : {book.author_name?.join(", ") || "Unknown author"}</p>

            <p>First published : {book.first_publish_year || "Unkown"}</p>

            {/* CHOOSE SHELF */}
            <div>
              <label htmlFor="discover-shelf">Add books to:</label>

              <select
                id="discover-shelf"
                value={selectedShelfId}
                onChange={(e) => setSelectedShelfId(e.target.value)}
              >
                <option value="">Choose a shelf</option>

                {shelves.map((shelf) => (
                  <option key={shelf.id} value={shelf.id}>
                    {shelf.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleAddToLibrary(book)}
              disabled={!selectedShelfId}
            >
              Add to My Library
            </button>
            <button
              onClick={() => {
                setSelectedBook(book); //sets selected book
                bookDetails(book); //fetch details from API
              }}
            >
              View details{" "}
            </button>
          </div>
        ))}

      {/* --------------------------------------------------- */}
      {/* DETAILED VIEW  */}
      {selectedBook && (
        <div>
          <h2>{selectedBook.title}</h2>

          {/* loading */}
          {detailLoading && <p>Loading book details...</p>}

          {/* error */}
          {!detailLoading && detailError && (
            <div>
              <p>{detailError}</p>

              <button onClick={() => bookDetails(selectedBook)}>Retry</button>
            </div>
          )}

          {/* success */}
          {!detailLoading && !detailError && detailData && (
            <div>
              <h3>Subjects</h3>

              {detailData.subjects?.length > 0 ? (
                <p>{detailData.subjects.slice(0, 10).join(", ")}</p>
              ) : (
                <p>No subjects available.</p>
              )}

              <p>Edition count: {selectedBook.edition_count ?? "Unknown"}</p>

              <a
                href={`https://openlibrary.org${selectedBook.key}`}
                target="_blank"
                rel="noreferrer"
              >
                View on OpenLibrary
              </a>

              
              {/* CHOOSE SHELF */}
              <div>
                <label htmlFor="discover-shelf">Add books to:</label>

                <select
                  id="discover-shelf"
                  value={selectedShelfId}
                  onChange={(e) => setSelectedShelfId(e.target.value)}
                >
                  <option value="">Choose a shelf</option>

                  {shelves.map((shelf) => (
                    <option key={shelf.id} value={shelf.id}>
                      {shelf.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleAddToLibrary(selectedBook)}
                disabled={!selectedShelfId}
              >
                Add to My Library
              </button>
            </div>
          )}

          <button
            onClick={() => {
              setSelectedBook(null);
              setDetailData(null);
              setDetailError("");
            }}
          >
            Close Details
          </button>
        </div>
      )}

      {/* --------------------------------------------------- */}
      {/* PREVIOUS-NEXT BUTTONS  */}
      {result.length > 0 && (
        <div>
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || loading}
          >
            Previous
          </button>

          <p>
            Page {currentPage} of {totalClientPages}
          </p>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalClientPages || loading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default BookDiscover;
