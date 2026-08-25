import React from "react";
import "./Summary.css";

function Summary({
  booksPerShelf,
  finishedThisYear,
  averageRating,
  yearlyGoal,
  goalPercentage,
  selectedYear,
  setSelectedYear,
  setYearlyGoal,
}) {

   const currentYear = new Date().getFullYear();
  return (
    <div id="main-container">
      {/* heading container  */}
      <div id="heading-container">
        <p>SUMMARY</p>
      </div>

      {/* summary container  */}
      <div id="summary-container">
        {booksPerShelf.map((shelf) => (
          <div className="count-container" key={shelf.shelfId}>
            <h3>{shelf.shelfName}</h3>
            <p>{shelf.count}</p>
          </div>
        ))}
        <div className="count-container">
          <h3>Average rating</h3>
          <p>{averageRating}</p>
        </div>
      </div>
      {/* yearly goal */}
      <div>
        <h3>Yearly Reading Goal</h3>

        {/* year selection */}
        <label>
          Year:
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value={currentYear}>{currentYear}</option>

            <option value={currentYear - 1}>{currentYear - 1}</option>

            <option value={currentYear - 2}>{currentYear - 2}</option>
          </select>
        </label>

        {/* goal control */}
        <label>
          Goal:
          <input
            type="number"
            min="0"
            value={yearlyGoal}
            onChange={(e) => setYearlyGoal(Number(e.target.value))}
          />
        </label>

        {/* progress */}
        {yearlyGoal === 0 ? (
          <p>No yearly goal set.</p>
        ) : (
          <div>
            <p>
              Finished: {finishedThisYear} / {yearlyGoal}
            </p>

            <progress value={goalPercentage} max="100" />

            <p>{goalPercentage}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Summary;
