import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
const App = () => {
  const { register, handleSubmit } = useForm();

  const submithandler = async (data) => {
    const formdata = new FormData();
    formdata.append("name", data.name);
    formdata.append("email", data.email);
    // the file at the 0 index
    // can share multiple file just do it directly without the index

    // the key has to be the same as in the multer upload
    // upload.single(this ->"profilepic"),
    // formdata.append("profilepic", data.profilepic);

    for (let file of data.profilepic) {
      formdata.append("profilepic", file);
    }

    await axios.post("http://localhost:3000/user/create", formdata);
  };

  return (
    <div>
      <form onSubmit={handleSubmit(submithandler)}>
        <input {...register("name")} type="text" placeholder="Enter name " />{" "}
        <br />
        <input
          {...register("email")}
          type="emai"
          placeholder="Enter email"
        />{" "}
        <br />
        <input
          {...register("profilepic")}
          type="file"
          // add a field "multiple" if had to upload multiple files at a time
          multiple
          placeholder="Upload ur image"
        />{" "}
        <br />
        <button>Submit</button>
      </form>
    </div>
  );
};

export default App;
