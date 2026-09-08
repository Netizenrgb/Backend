import axios from "axios";
import React, { useEffect, useState } from "react";
import Viewnote from "../components/Viewnote";

const ViewAllNotes = () => {
  const [allnotes, setAllnotes] = useState([]);

  // GET ALL NOTES
  const getallnotes = async () => {
    try {
      let res = await axios.get(
        "http://localhost:3000/notes/allnotes"
      );

      setAllnotes(res.data.data);
    } catch (error) {
      console.log(
        "Error in get allnotes api call in frontend -> ",
        error
      );
    }
  };

  // GET NOTES WHEN COMPONENT LOADS
  useEffect(() => {
    getallnotes();
  }, []);

  // DELETE NOTE
  const delnotes = async (id) => {
    try {
      let res = await axios.delete(
        `http://localhost:3000/notes/${id}`
      );

      console.log("Delete response -> ", res);

      // Get updated notes from database
      getallnotes();

    } catch (error) {
      console.log(
        "Error in delete note -> ",
        error
      );
    }
  };

  // UPDATE NOTE
  const updatenote = async (id, updatedData) => {
    try {
      let res = await axios.patch(
        `http://localhost:3000/notes/${id}/singlenote`,
        updatedData
      );

      console.log("Update response -> ", res);

      // Get updated notes from database
      getallnotes();

    } catch (error) {
      console.log(
        "Error in the update api in frontend -> ",
        error
      );
    }
  };

  return (
    <div>
      {allnotes.map((val) => (
        <Viewnote
          key={val._id}
          notes={val}
          delnotes={delnotes}
          updatenote={updatenote}
        />
      ))}
    </div>
  );
};

export default ViewAllNotes;