const BookHelper = (book, finishedShelfId) =>{
    
    const updatedBook = {...book};

    // if book is not in finished shelf 
    if(updatedBook.shelfId !== finishedShelfId){
        updatedBook.rating = "";
    }

    //if book finished
    else{
        const rating = Number(updatedBook.rating);

        if(rating < 1 || rating > 5 || isNaN(rating)){
            updatedBook.rating = "";
        }
        else{
            updatedBook.rating = String(rating);
        }
    }

    return updatedBook;
}

export default BookHelper