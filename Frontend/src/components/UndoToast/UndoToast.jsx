import React from 'react'
import './UndoToast.css'

function UndoToast({book, onUndo}) {
    if(!book){
        return null;
    }
  return (
    <div className="undo-toast">
      <p>
        "{book.title}" deleted
      </p>

      <button onClick={onUndo}>
        Undo
      </button>
    </div>
  )
}

export default UndoToast
