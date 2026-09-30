import { createBrowserRouter } from "react-router";
import Register from "../modules/auth/pages/Register";
import Profile from "../modules/auth/pages/Profile";
import Home from "./Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
]);

export default router;
