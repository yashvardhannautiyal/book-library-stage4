import React from "react";
import "./SearchFilter.css";

function SearchFilter({
  searchTerm,
  setSearchTerm,
  shelfFilter,
  setShelfFilter,
  shelves
}) {
  return (
    <div id="main-container">
      {/* heading container  */}
      <div id="heading-container">
        <p>SEARCH & FILTER</p>
      </div>

      {/* search-filter container  */}
      <div id="search-filter">
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={shelfFilter}
          onChange={(e) => setShelfFilter(e.target.value)}
        >
          <option value="all">All shelves</option>
          
          {shelves.map((shelf) =>(
            <option key = {shelf.id} value = {shelf.id}>{shelf.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default SearchFilter;
