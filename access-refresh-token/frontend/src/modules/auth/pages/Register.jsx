import React, { useState } from "react";
import { useApi } from "../../shared/useapi";
import { useAuthContext } from "../context/useAuthContext";
import { useNavigate } from "react-router";

const Register = () => {
  const api = useApi();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const authcontext = useAuthContext();

  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    /* the endpoint to this is /auth/reg because the servers (backend) controller has a /reg and the mount point is "api/auth" so any api call starting from api will be forwarded to server */

    /* 
     Basically the endpoint has to be completed can add the mount point here or in the where the base url is created in ts case this its useapi.js 

    can be ts  baseURL: "http://localhost:5173/api" 
              or 
    baseURL: "http://localhost:5173/api/auth" -> if ts then api call becomes 

        const res = await api.post("/reg")
    
     */

    const res = await api.post("/auth/reg", {
      name,
      email,
      password,
    });

    console.log("FULL API RESPONSE:", res);
    console.log("RESPONSE DATA:", res.data);

    // The backend returns an access token after successful registration.
    // We take that token from the API response and pass it to setAccessToken(),
    // which updates the accessToken state inside AuthContext.
    // Since AuthProvider wraps the app, this token can now be accessed
    // from any component using useAuthContext().

    // accesstoken , which is being returned from the backend
    authcontext.setAccessToken(res.data.accesstoken);

    // data is present in the data.data
    authcontext.setUser(res.data.data);


    navigate("/profile");
  }

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input
          className=" border-2 rounded-xl p-1.5 flex "
          type=" text"
          value={name}
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className=" border-2 rounded-xl p-1.5 flex  "
          type=" email"
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className=" border-2 rounded-xl p-1.5 flex "
          type=" password"
          value={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="border-2 rounded-2xl p-2">Register</button>
      </form>
    </main>
  );
};

export default Register;
