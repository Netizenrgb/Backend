import React from "react";
import { useNavigate } from "react-router";

const Home = () => {
  const nav = useNavigate();
  return (
    <div>
      <h1>This is the home page </h1>
      <button onClick={() => nav("/register")}>
        Click here to navigate to registration page
      </button>
    </div>
  );
};

export default Home;
