import { useState, useEffect } from "react";
import AddBookForm from "./components/AddBookForm/AddBookForm.jsx";
import BookList from "./components/BookList/BookList.jsx";
import Summary from "./components/Summary/Summary.jsx";
import SearchFilter from "./components/SearchFilter/SearchFilter.jsx";
import BookHelper from "./utils/BookHelper.js";
import ShelfManagement from "./components/ShelfManagement/ShelfManagement.jsx";
import UndoToast from "./components/UndoToast/UndoToast.jsx";
import BookDiscover from "./components/Discover/BookDiscover.jsx";

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
// DEFAULT - starter shelves
const STARTER_SHELVES = [
  {
    id: "to-read",
    name: "To Read",
    isFinishedShelf: false,
  },
  {
    id: "reading",
    name: "Reading",
    isFinishedShelf: false,
  },
  {
    id: "finished",
    name: "Finished",
    isFinishedShelf: true, //this makes only one starter shelf as finished
  },
];

//------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------
// MIGRATE STATUS -> TO -> SHELFID
const migrateBooks = (books, shelves) => {
  const statusToShelfId = {
    "To Read": "to-read",
    Reading: "reading",
    Finished: "finished",
  };

  //checks if the shelf is valid or not
  const validShelfIds = shelves.map((shelf) => shelf.id);

  const fallbackShelfId = validShelfIds.includes("to-read")
    ? "to-read"
    : validShelfIds[0];

  return books.map((book) => {
    let shelfId;

    // Old Stage 1 book
    if (book.status) {
      shelfId = statusToShelfId[book.status];
    } else {
      // Already shelf-based book
      shelfId = book.shelfId;
    }

    // Make sure the shelf actually exists
    if (!validShelfIds.includes(shelfId)) {
      shelfId = fallbackShelfId;
    }

    // Remove old status and return shelf-based book
    const { status, ...rest } = book;

    return {
      ...rest,
      shelfId,
      finishedAt: book.finishedAt ?? null,
    };
  });
};

function App() {
  const [activeView, setActiveView] = useState("library");

  // BOOK UNDO-DELETE + SHOW UNDO STATE
  const [deletedBook, setDeletedBook] = useState(null);
  const [showUndoToast, setShowUndoToast] = useState(false);

  // SHELVES STATE
  const [shelves, setShelves] = useState(() => {
    const savedShelves = localStorage.getItem("shelves");

    if (!savedShelves) {
      return STARTER_SHELVES;
    }

    return JSON.parse(savedShelves);
  });

  //save shelves to localstorage
  useEffect(() => {
    localStorage.setItem("shelves", JSON.stringify(shelves));
  }, [shelves]);

  //checks the finished shelf
  const finishedShelf = shelves.find((shelf) => shelf.isFinishedShelf);

  //optional chaining - "?"
  //only try to acces ".id" id "finishedShelf" actually exists
  //will not shrow error if we try to access .id of undefined
  //instead of crashing it becomes "undefined"
  const finishedShelfId = finishedShelf?.id;

  //------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------
  // BOOKS STATE
  //takes the book from books with status and migrate books to shelf (then remove status and add shelfID)
  const [books, setBooks] = useState(() => {
    const savedBooks = localStorage.getItem("books");

    if (!savedBooks) {
      return [];
    }

    const parsedBooks = JSON.parse(savedBooks);

    return migrateBooks(parsedBooks, shelves);
  });

  //save books to local storage
  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books));
  }, [books]);

  //------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------
  //BOOK FUNCTIONS
  //add new book
  const handleAddBook = (newBook) => {
    const targetShelf = shelves.find((shelf) => shelf.id === newBook.shelfId);

    const bookFinishDate = {
      ...newBook,
      finishedAt: targetShelf?.isFinishedShelf
        ? new Date().toISOString()
        : null,
    };

    setBooks((prevBooks) => [...prevBooks, bookFinishDate]);
  };

  // delete book
  const handleDelete = (bookToDelete) => {
    // save complete book so it can be restored exactly
    setDeletedBook(bookToDelete);

    // remove the book from the library
    setBooks((prevBooks) =>
      prevBooks.filter((book) => book.id !== bookToDelete.id),
    );

    // show undo toast
    setShowUndoToast(true);
  };

  //------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------
  // UNDO TIMER FUNCTION
  // timer
  useEffect(() => {
    if (!showUndoToast) {
      return;
    }

    const timer = setTimeout(() => {
      setShowUndoToast(false);
      setDeletedBook(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [showUndoToast]);

  // undo the most recent book deletion
  const handleUndoDelete = () => {
    if (!deletedBook) {
      return;
    }

    //------------------------------------------------------------------------------------------------------------
    //------------------------------------------------------------------------------------------------------------
    //CHECK SHELF EXISTS
    // Check whether the book's original shelf still exists
    const shelfExists = shelves.some(
      (shelf) => shelf.id === deletedBook.shelfId,
    );

    // Restore the exact book if its shelf still exists
    if (shelfExists) {
      setBooks((prevBooks) => [...prevBooks, deletedBook]);
    } else {
      // If original shelf deleted
      // move book to valid existing shelf
      const fallbackShelfId = shelves[0]?.id;

      if (fallbackShelfId) {
        setBooks((prevBooks) => [
          ...prevBooks,
          {
            ...deletedBook,
            shelfId: fallbackShelfId,
          },
        ]);
      }
    }

    setDeletedBook(null);
    setShowUndoToast(false);
  };

  // EDIT BOOKS
  const handleEdit = (updatedBook) => {
    setBooks((prevBooks) =>
      prevBooks.map((book) => {
        if (book.id !== updatedBook.id) {
          return book;
        }

        // older version of shelf
        const oldShelf = shelves.find((shelf) => shelf.id === book.shelfId);

        //updated version of shelf
        const newShelf = shelves.find(
          (shelf) => shelf.id === updatedBook.shelfId,
        );

        //check if shelf was finished
        const wasFinished = oldShelf?.isFinishedShelf === true;
        const isFinished = newShelf?.isFinishedShelf === true;

        let finishedAt = book.finishedAt ?? null;

        // Moving INTO finished shelf
        if (!wasFinished && isFinished) {
          finishedAt = new Date().toISOString();
        }

        // Moving OUT OF finished shelf
        if (wasFinished && !isFinished) {
          finishedAt = null;
        }

        return {
          ...updatedBook,
          finishedAt,
        };
      }),
    );
  };

  //------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------
  //-----------------SHELF MANAGEMENT FUNCTIONS----------------
  // create a new shelf
  const handleCreateShelf = (shelfName) => {
    const newShelf = {
      id: Date.now().toString(),
      name: shelfName.trim(),
      isFinishedShelf: false,
    };

    setShelves((prevShelves) => [...prevShelves, newShelf]);
  };

  // rename an existing shelf
  const handleRenameShelf = (shelfId, newName) => {
    setShelves((prevShelves) =>
      prevShelves.map((shelf) =>
        shelf.id === shelfId ? { ...shelf, name: newName.trim() } : shelf,
      ),
    );
  };

  // marks exactly one shelf as the finished shelf
  const handleSetFinishedShelf = (shelfId) => {
    setShelves((prevShelves) =>
      prevShelves.map((shelf) => ({
        ...shelf,
        isFinishedShelf: shelf.id === shelfId,
      })),
    );
  };

  //DELETE SHELF
  const handleDeleteShelf = (shelfId, destinationShelfId) => {
    // Do not allow deleting the only remaining shelf
    if (shelves.length <= 1) {
      return;
    }

    //  destination shelf must be selected
    if (!destinationShelfId) {
      return;
    }

    // destination must be existing shelf
    const destinationExists = shelves.some(
      (shelf) => shelf.id === destinationShelfId,
    );

    if (!destinationExists) {
      return;
    }

    // Cannot move books to the shelf that is being deleted
    if (destinationShelfId === shelfId) {
      return;
    }

    // Move all books first while preserving every other property
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.shelfId === shelfId
          ? {
              ...book,
              shelfId: destinationShelfId,
            }
          : book,
      ),
    );

    // Remove the shelf only after books have been reassigned
    setShelves((prevShelves) =>
      prevShelves.filter((shelf) => shelf.id !== shelfId),
    );
  };

  //------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------
  // ---------------------SEARCH----------------------
  const [searchTerm, setSearchTerm] = useState("");
  const [shelfFilter, setShelfFilter] = useState("all");

  //filter
  const filteredBooks = books.filter((book) => {
    // Search
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());

    // match shelf
    const matchesShelf = shelfFilter === "all" || book.shelfId === shelfFilter;

    return matchesSearch && matchesShelf;
  });

  //------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------
  // -----------------------------summary count-----------------------
  const toReadCount = books.filter((e) => e.shelfId === "to-read").length;

  const readingCount = books.filter((e) => e.shelfId === "reading").length;

  const finishedCount = books.filter(
    (e) => e.shelfId === finishedShelfId,
  ).length;

  // FINISHED BOOKS
  const finishedBooks = books.filter((book) => {
    const rating = Number(book.rating);

    return (
      book.shelfId === finishedShelfId &&
      !isNaN(rating) &&
      rating >= 1 &&
      rating <= 5
    );
  });

  // AVERAGE RATING
  const averageRating =
    finishedBooks.length > 0
      ? (
          finishedBooks.reduce((sum, book) => sum + Number(book.rating), 0) /
          finishedBooks.length
        ).toFixed(1)
      : 0;

  //------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------
  //-----------finished this year----------------
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const finishedThisYear = books.filter((book) => {
    if (!book.finishedAt) {
      return false;
    }

    const finishedYear = new Date(book.finishedAt).getFullYear();

    return finishedYear === selectedYear;
  }).length;

  const booksPerShelf = shelves.map((shelf) => ({
    shelfId: shelf.id,
    shelfName: shelf.name,
    count: books.filter((book) => book.shelfId === shelf.id).length,
  }));

  //------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------
  // ------------ YEARLY GOALS -------------------
  const [yearlyGoal, setYearlyGoal] = useState(() => {
    const savedGoal = localStorage.getItem("yearlyGoal");

    if (!savedGoal) {
      return 12;
    }

    const parsedGoal = Number(savedGoal);

    return Number.isFinite(parsedGoal) && parsedGoal >= 0 ? parsedGoal : 12;
  });

  // update and save every time yearly goal changes
  useEffect(() => {
    localStorage.setItem("yearlyGoal", String(yearlyGoal));
  }, [yearlyGoal]);

  //--------------goal percentage-----------------
  const goalPercentage =
    yearlyGoal > 0
      ? Math.min(100, Math.round((finishedThisYear / yearlyGoal) * 100))
      : 0;

  //------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------
  //-----------------PAGINATION------------
  const [currentPage, setCurrentPage] = useState(1);

  const BOOKS_PER_PAGE = 5;

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);

  const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;

  const paginatedBooks = filteredBooks.slice(
    startIndex,
    startIndex + BOOKS_PER_PAGE,
  );

  // reset pages when filtering change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, shelfFilter]);

  //------------------------------------------------------------------------------------------------------------
  //------------------------------------------------------------------------------------------------------------
  //app return
  return (
    <div>
      {/* view switch buttons  */}
      <div>
        <button onClick={() => setActiveView("library")}>
          My library
        </button>
        <button onClick={() => setActiveView("discover")}>
          Discover books
        </button>
      </div>

      {/* my library  */}

      {activeView === "library" && (
        <>
          {/* form */}
          <AddBookForm onAddBook={handleAddBook} shelves={shelves} />
          {/* pass shelves as prop so that AddBookForm can access the shelves */}

          <ShelfManagement
            shelves={shelves}
            onCreateShelf={handleCreateShelf}
            onRenameShelf={handleRenameShelf}
            onDeleteShelf={handleDeleteShelf}
            onSetFinishedShelf={handleSetFinishedShelf}
          />
          {/* summary */}
          <Summary
            booksPerShelf={booksPerShelf}
            finishedThisYear={finishedThisYear}
            averageRating={averageRating}
            yearlyGoal={yearlyGoal}
            goalPercentage={goalPercentage}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            setYearlyGoal={setYearlyGoal}
          />

          {/* search filter  */}
          <SearchFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            shelfFilter={shelfFilter}
            setShelfFilter={setShelfFilter}
            shelves={shelves}
          />

          {/* booklist  */}
          <BookList
            books={paginatedBooks}
            onDelete={handleDelete}
            onEdit={handleEdit}
            totalBooks={books.length}
            shelves={shelves}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          {showUndoToast && (
            <UndoToast book={deletedBook} onUndo={handleUndoDelete} />
          )}
        </>
      )}

      {/* dicover  */}
      {activeView === "discover" &&
       <BookDiscover 
       shelves={shelves}
       onAddBook={handleAddBook}
       />}
    </div>
  );
}

export default App;
