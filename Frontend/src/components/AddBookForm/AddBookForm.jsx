import { useState } from "react";
import "./AddBookForm.css";
import BookHelper from "../../utils/BookHelper";
import BookValidation from "../../utils/BookValidation";

function AddBookForm({ onAddBook, shelves }) {
  //   user data change
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [shelfId, setShelfId] = useState("");
  const [rating, setRating] = useState("");

  //error
  const [errors, setErrors] = useState({
    title: "",
    author: "",
    rating: "",
    shelf: "",
  });

  const finishedShelf = shelves.find((shelf) => shelf.isFinishedShelf);

  const finishedShelfId = finishedShelf?.id;

  // function - handle shelf change
  const handleShelfChange = (e) => {
    const value = e.target.value;
    setShelfId(value);

    if (errors.shelf) {
      setErrors({
        ...errors,
        shelf: "",
      });
    }
  };

  //   submit button
  const handleSubmit = (e) => {
    e.preventDefault();

    //creates a newBook object
    const newBook = {
      id: Date.now(),
      title: title.trim(),
      author: author.trim(),
      shelfId,
      rating,
    };

    //check for error in the newBook with help of BookValidation helper function
    const newErrors = BookValidation(newBook, shelves);

    //sets new errors that are or not found
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const validBook = BookHelper(newBook, finishedShelfId);

    onAddBook(validBook);

    setTitle("");
    setAuthor("");
    setShelfId("");
    setRating("");

    setErrors({
      title: "",
      author: "",
      rating: "",
      shelf: "",
    });
  };
  return (
    <div id="form-component">
      <div id="heading-container">
        {/* heading  */}
        <h1 id="heading">Book Library</h1>
        <p id="heading-text">
          Keep track of what you want to read, what you're reading, and what you
          finished.
        </p>
      </div>

      {/* form  */}
      <div id="form-container">
        <h4>ADD A BOOK</h4>

        <form onSubmit={handleSubmit}>
          {/* title  */}
          <div>
            <label>TITLE</label>
            <input
              type="text"
              placeholder="book title"
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);

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
          {/* author  */}
          <div>
            <label>AUTHOR</label>
            <input
              type="text"
              placeholder="author's name"
              id="author"
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value);

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

          {/* status  */}
          <div>
            <label htmlFor="shelf">SHELF</label>
            <select id="shelf" value={shelfId} onChange={handleShelfChange}>
              <option value="">Select a shelf</option>
              {/* gives all the options that are created as a shelf previously  */}
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
            <label htmlFor="rating">RATING</label>
            <select
              id="rating"
              value={rating}
              disabled={shelfId !== finishedShelfId}
              onChange={(e) => {
                setRating(e.target.value);

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

          <button type="submit">Add Book</button>
        </form>
      </div>
    </div>
  );
}

export default AddBookForm;
