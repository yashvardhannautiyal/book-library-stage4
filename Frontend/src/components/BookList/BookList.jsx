import React from "react";
import "./BookList.css";
import BookItem from "../BookItem/BookItem.jsx";

function BookList({
  books,
  onDelete,
  onEdit,
  totalBooks,
  shelves,
  currentPage,
  totalPages,
  onPageChange,
}) {
  return (
    <div id="main-container">
      {/* heading container */}
      <div id="heading-container">
        <p>MY LIBRARY</p>
      </div>

      {/* book-list container */}
      <div id="book-list-container">
        {/* no books added yet */}
        {totalBooks === 0 ? (
          <p className="empty">No books added yet.</p>
        ) : books.length === 0 ? (
          <p className="empty">
            No books match your search or filter.
          </p>
        ) : (
          <>
            {/* display books */}
            {books.map((book) => (
              <BookItem
                key={book.id}
                book={book}
                onDelete={onDelete}
                onEdit={onEdit}
                shelves={shelves}
              />
            ))}

            {/* pagination */}
            <div>
              <button
                onClick={() =>
                  onPageChange(currentPage - 1)
                }
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  onPageChange(currentPage + 1)
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BookList;