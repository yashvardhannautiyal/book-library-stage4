const BookValidation = (book, shelves) => {
  const errors = {};
  // title
  if (book.title.trim() === "") {
    errors.title = "Title is required";
  }
  // author
  if (book.author.trim() === "") {
    errors.author = "Author is required";
  }
  //shelf is required

  if(!book.shelfId){
    errors.shelf = "Shelf is required";
  }

  //selected shelf must exist
  const shelfExists = shelves.some( //matches shelf id
    (e) => e.id === book.shelfId
  );

  if(book.shelfId && !shelfExists){
    errors.shelf = "Selected shelf does not exist";
  }


  return errors;
};

export default BookValidation;
