import React, { useState } from "react";
import axios from "axios";

const CreateNotes = () => {
  const [formvalues, setFormvalues] = useState({
    title: "",
    description: "",
  });

  const handlechange = (e) => {
    setFormvalues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formvalues);

    // api call
    let res = await axios.post(
      // pass the form values with the api

      "http://localhost:3000/notes/create",
      formvalues,
    );

    console.log(res);

    setFormvalues({
      title: "",
      description: "",
    });
  };

  return (
    <div className="flex min-h-screen flex-col gap-5 p-5">
      <h1 className="text-3xl font-semibold">Notes App</h1>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-white/20 bg-black p-4"
      >
        <input
          onChange={handlechange}
          value={formvalues.title}
          // set the name same as the scheme in db
          name="title"
          type="text"
          placeholder="Title"
          className="rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white placeholder-gray-400 outline-none focus:border-blue-500"
        />

        <textarea
          onChange={handlechange}
          minLength={5}
          required
          value={formvalues.description}
          // set the name same as the scheme in db
          name="description"
          placeholder="Description"
          className="min-h-24 resize-none rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-white placeholder-gray-400 outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700"
        >
          Add Note
        </button>
      </form>
    </div>
  );
};

export default CreateNotes;
