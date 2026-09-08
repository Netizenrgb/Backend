import React, { useState } from "react";

const Viewnote = ({ notes, delnotes, updatenote }) => {
  // Controls whether we show the note or the edit form
  const [isEditing, setIsEditing] = useState(false);

  // Stores the values the user is editing
  const [formvalues, setFormvalues] = useState({
    title: notes.title,
    description: notes.description,
  });

  // Handle input changes
  const handleChange = (e) => {
    setFormvalues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Save the updated note
  const handleUpdate = async () => {
    await updatenote(notes._id, formvalues);

    // Go back to normal note view
    setIsEditing(false);
  };

  return (
    <div className="max-w-md mx-auto my-6 p-6 bg-white rounded-xl shadow-md border border-gray-100 transition-all hover:shadow-lg">
      <div className="space-y-4">
        {isEditing ? (
          // =========================
          // EDIT MODE
          // =========================

          <>
            <input
              type="text"
              name="title"
              value={formvalues.title}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 text-black"
              placeholder="Title"
            />

            <textarea
              name="description"
              value={formvalues.description}
              onChange={handleChange}
              className="w-full min-h-24 rounded-md border border-gray-300 p-2 text-black"
              placeholder="Description"
            />

            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium text-sm rounded-lg"
              >
                Save
              </button>

              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white font-medium text-sm rounded-lg"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          // =========================
          // NORMAL VIEW MODE
          // =========================

          <>
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
              {notes?.title || "Untitled Note"}
            </h1>

            {/* Description */}
            <p className="text-gray-600 text-base leading-relaxed break-words">
              {notes?.description || "No description provided."}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              {/* UPDATE */}
              <button
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg"
                onClick={() => setIsEditing(true)}
              >
                Update
              </button>

              {/* DELETE */}
              <button
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-sm rounded-lg"
                onClick={() => delnotes(notes._id)}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Viewnote;
