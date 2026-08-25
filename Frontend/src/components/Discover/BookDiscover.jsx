import React, { useEffect, useState } from "react";

function BookDiscover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState([]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // timer
    const timer = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setResult([]);
        return;
      }
      try {
        setLoading(true);

        // fetch api
        //encodeURIComponent - convert a string to URL safe format with special characters
        const response = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&page=1`,
        );

        const data = await response.json();

        setResult(data.docs || []);
      } catch (err) {
        console.log("Failed to fetch books : ", err);
      } finally {
        setLoading(false);
      }
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
        
        {/* not loading  */}
        {!loading &&
          result.map((book) => (
            <div key = {book.key}>
                    <h3>{book.title}</h3>

                    <p>Author : {" "}
                        {book.author_name?.join(", ") || "Unknown author"}
                    </p>

                    <p>First published : {" "}
                        {book.first_publish_year || "Unkown"}
                    </p>
            </div>
          ))  }
    </div>
  );
}

export default BookDiscover;
