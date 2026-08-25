import { useState } from "react";

function ShelfManagement({
  shelves,
  onCreateShelf,
  onRenameShelf,
  onDeleteShelf,
  onSetFinishedShelf,
}) {
  const [newShelfName, setNewShelfName] = useState("");
  const [editingShelfId, setEditingShelfId] = useState(null);
  const [editingName, setEditingName] = useState("");

  //delete states
  const [deletingShelfId, setDeletingShelfId] = useState(null);
  const [destinationShelfId, setDestinationShelfId] = useState("");

  // create shelf
  const handleCreate = () => {
    const name = newShelfName.trim();

    if (!name) {
      return;
    }

    onCreateShelf(name);
    setNewShelfName("");
  };

  // rename shelf
  const startRename = (shelf) => {
    setEditingShelfId(shelf.id);
    setEditingName(shelf.name);
  };

  const handleRename = () => {
    const name = editingName.trim();

    if (!name) {
      return;
    }
    onRenameShelf(editingShelfId, name);

    setEditingName("");
    setEditingShelfId(null);
  };

  // delete shelf
  const startDelete = (shelf) => {
    setDeletingShelfId(shelf.id);
    setDestinationShelfId("");
  };

  const handleDelete = () => {
    if (!destinationShelfId) {
      return;
    }

    onDeleteShelf(deletingShelfId, destinationShelfId);

    setDeletingShelfId(null);
    setDestinationShelfId("");
  };

  const cancelDelete = () => {
    setDeletingShelfId(null);
    setDestinationShelfId("");
  };
  return (
    <div>
      <h2>Shelves</h2>

      {/* create shelf  */}
      <div>
        <input
          type="text"
          placeholder="Enter new shelf name"
          value={newShelfName}
          onChange={(e) => setNewShelfName(e.target.value)}
        />

        <button onClick={handleCreate}>Create shelf</button>
      </div>

      {/* display existing shelves  */}
      <div>
        {shelves.map((shelf) => (
          <div key={shelf.id}>
            {editingShelfId === shelf.id ? (
              // rename mode
              <div>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
                {/* save btn  */}
                <button onClick={handleRename}>Save</button>
                {/* cancel btn  */}
                <button
                  onClick={() => {
                    setEditingShelfId(null);
                    setEditingName("");
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : deletingShelfId === shelf.id ? (
              // delete mode
              <div>
                <p>Delete "{shelf.name}" and move its books to:</p>

                <select
                  value={destinationShelfId}
                  onChange={(e) => setDestinationShelfId(e.target.value)}
                >
                  <option value="">Move books to...</option>

                  {shelves
                    .filter((s) => s.id !== deletingShelfId)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </select>

                <button onClick={handleDelete} disabled={!destinationShelfId}>
                  Confirm Delete
                </button>

                <button onClick={cancelDelete}>Cancel</button>
              </div>
            ) : (
              // NORMAL MODE
              <div>
                <p>{shelf.name}</p>

                {shelf.isFinishedShelf ? (
                  <p>Finished Shelf</p>
                ) : (
                  <button onClick={() => onSetFinishedShelf(shelf.id)}>
                    Mark as Finished Shelf
                  </button>
                )}

                <button onClick={() => startRename(shelf)}>Rename</button>

                {shelves.length > 1 && (
                  <button onClick={() => startDelete(shelf)}>Delete</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShelfManagement;
