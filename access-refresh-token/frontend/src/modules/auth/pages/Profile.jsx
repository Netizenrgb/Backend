import React, { useEffect } from "react";
import { useAuthContext } from "../context/useAuthContext";
import { useApi } from "../../shared/useapi";

const Profile = () => {
  const authContext = useAuthContext();
  const api = useApi();

  async function fetchprofile() {
    const res = await api.get("/auth/me");

    console.log("FULL RESPONSE:", res);
    console.log("RESPONSE DATA:", res.data);
    console.log("DATA:", res.data);

    authContext.setUser(res.data);
    console.log("authcontextdata-> front end ", authContext);
  }

  useEffect(() => {
    fetchprofile();
  }, []);

  return (
    <main>
      <h1>Profile</h1>
      <p>Name : {authContext.user?.name}</p>
      <p>Email : {authContext.user?.email}</p>
    </main>
  );
};

export default Profile;
