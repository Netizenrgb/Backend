import axios from "axios";
import { useAuthContext } from "../auth/context/useAuthContext";

export function useApi() {
  // user,setUser,accessToken,setAccessToken
  const authContext = useAuthContext();

  //   all the api call will be made using ts var (api)
  const api = axios.create({
    // Base URL automatically prepended to relative API requests
    // made using this Axios instance.
    baseURL: "http://localhost:5173/api",
    // the refresh token is stored in cookies ,so to store the refreshtokens in the cookie we use withCredentials:true
    withCredentials: true,
  });

  //   using the interseptor we can read/modify the data that is being sent through this particular api
  // only on the req the res can also be intercepted aswell

  api.interceptors.request.use((config) => {
    // the changes in te react state var are not instantenous so when we use the refresh api to generate a new access token so we have to bypass it at that time we'll not use api ( const api = axios.create) instead we'll use axios directly
    config.headers.Authorization = `Bearer ${authContext.accessToken}`;
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response && error.response.status === 401) {
        console.log("unauthorized,need to refresh");
        const res = await axios.post(
          "/api/auth/refresh",
          {},
          { withCredentials: true },
        );

        console.log("Refreshing access token ", res);

        authContext.setAccessToken(res.data.accesstoken);

        error.config.headers.Authorization = `Bearer ${res.data.accesstoken}`;

        return api(error.config);
      }
      return Promise.reject(error);
    },
  );

  return api;
}
