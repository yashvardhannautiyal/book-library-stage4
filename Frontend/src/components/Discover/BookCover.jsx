import { useState } from "react";

function BookCover({ coverId, title }) {
  const [imageError, setImageError] = useState(false);

  const coverUrl = coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : null;

  if (!coverUrl || imageError) {
    return (
      <div>
        <span>📚</span>
        <p>No Cover</p>
      </div>
    );
  }

  return (
    <img
      src={coverUrl}
      alt={`Cover of ${title}`}
      onError={() => setImageError(true)}
    />
  );
}

export default BookCover;