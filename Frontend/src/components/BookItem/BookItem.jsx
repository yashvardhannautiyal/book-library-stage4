import { useState, useEffect } from "react";
import "./BookItem.css";
import BookHelper from "../../utils/BookHelper";
import BookValidation from "../../utils/BookValidation";

function BookItem({ book, onDelete, onEdit, shelves }) {
  //edit mode
  const [isEditing, setIsEditing] = useState(false);

  //edited book data
  const [editedBook, setEditedBook] = useState({ ...book });

  //error
  const [errors, setErrors] = useState({
    title: "",
    author: "",
    rating: "",
    shelf: "",
  });

  //handle edit button func
  const handleEdit = () => {
    setEditedBook({ ...book });
    setErrors({
      title: "",
      author: "",
      rating: "",
      shelf: "",
    });
    setIsEditing(true);
  };

  // gives shelf id
  const finishedShelfId = shelves.find((shelf) => shelf.isFinishedShelf)?.id;
  //shelf change
  const handleShelfChange = (e) => {
    const value = e.target.value;

    setEditedBook({
      ...editedBook,
      shelfId: value,
      rating: value === finishedShelfId ? editedBook.rating : "",
    });

    if (value !== finishedShelfId) {
      setErrors({
        ...errors,
        rating: "",
      });
    }

    if (errors.shelf) {
      setErrors({
        ...errors,
        shelf: "",
      });
    }
  };

  //save
  const handleSave = () => {
    const newErrors = BookValidation(editedBook, shelves);

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const validBook = BookHelper(editedBook, finishedShelfId);

    onEdit(validBook);

    setIsEditing(false);

    setErrors({
      title: "",
      author: "",
      rating: "",
      shelf: "",
    });
  };

  // cancel
  const handleCancel = () => {
    setEditedBook({ ...book });

    setErrors({
      title: "",
      author: "",
      rating: "",
      shelf: "",
    });
    setIsEditing(false);
  };

  //sync editedBook with updated props
  useEffect(() => {
    setEditedBook({ ...book });
  }, [book]);

  return (
    <div id="book-item">
      {isEditing ? (
        // edit mode
        <>
          {/* edit title  */}
          <div>
            <label htmlFor="edit-title">Title</label>

            <input
              type="text"
              id="edit-title"
              value={editedBook.title}
              onChange={(e) => {
                setEditedBook({
                  ...editedBook,
                  title: e.target.value,
                });

                // Clear the error as the user types
                if (errors.title) {
                  setErrors({
                    ...errors,
                    title: "",
                  });
                }
              }}
            />

            {errors.title && <p className="error">{errors.title}</p>}
          </div>

          {/* edit author  */}
          <div>
            <label htmlFor="edit-author">Author</label>

            <input
              type="text"
              id="edit-author"
              value={editedBook.author}
              onChange={(e) => {
                setEditedBook({
                  ...editedBook,
                  author: e.target.value,
                });

                // Clear the error as the user types
                if (errors.author) {
                  setErrors({
                    ...errors,
                    author: "",
                  });
                }
              }}
            />

            {errors.author && <p className="error">{errors.author}</p>}
          </div>

          {/* shelf  */}
          <div>
            <label htmlFor="edit-shelf">Shelf</label>

            <select
              id="edit-shelf"
              value={editedBook.shelfId}
              onChange={handleShelfChange}
            >
              <option value="">Select a shelf</option>

              {shelves.map((shelf) => (
                <option key={shelf.id} value={shelf.id}>
                  {shelf.name}
                </option>
              ))}
            </select>

            {errors.shelf && <p className="error">{errors.shelf}</p>}
          </div>

          {/* rating  */}
          <div>
            <label htmlFor="rating">Rating</label>

            <select
              id="rating"
              value={editedBook.rating}
              disabled={editedBook.shelfId !== finishedShelfId}
              onChange={(e) => {
                setEditedBook({
                  ...editedBook,
                  rating: e.target.value,
                });

                if (errors.rating) {
                  setErrors({
                    ...errors,
                    rating: "",
                  });
                }
              }}
            >
              <option value="">Select Rating</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
            {errors.rating && <p className="error">{errors.rating}</p>}
          </div>

          <div className="btn-container">
            <button className="btn" onClick={handleSave}>
              Save
            </button>
            <button className="btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        // display mode
        <div id="details">
          {/* title  */}
          <h3 id="book-title">{book.title}</h3>
          {/* author  */}
          <p id="book-author">{book.author}</p>
          {/* shelf  */}
          <p id="book-shelf">
            Shelf:{" "}
            {shelves.find((shelf) => shelf.id === book.shelfId)?.name ||
              "Unknown"}
          </p>
          {/* rating  */}
          <p>
            Rating:{" "}
            {book.shelfId === finishedShelfId ? book.rating || "-" : "-"}
          </p>

          <div className="btn-container">
            <button className="edit-btn" onClick={handleEdit}>
              Edit
            </button>
            {/* delete  */}
            <button className="delete-btn" onClick={() => onDelete(book)}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookItem;
