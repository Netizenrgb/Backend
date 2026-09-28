import { createContext, useContext, useEffect, useState } from "react";
import api, {
  refreshApi,
  setAccessToken as setApiAccessToken,
  setAuthFailureHandler,
} from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // LOGIN
  const login = async (token) => {
    setApiAccessToken(token);
    setAccessToken(token);

    try {
      const response = await api.get("/auth/me");

      setUser(response.data.user);
    } catch (error) {
      setApiAccessToken(null);
      setAccessToken(null);
      setUser(null);

      throw error;
    }
  };

  // LOGOUT
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      // Clear access token from Axios
      setApiAccessToken(null);

      // Clear access token from React state
      setAccessToken(null);

      // Clear logged-in user
      setUser(null);
    }
  };

  // RESTORE SESSION WHEN APP LOADS
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await refreshApi.post("/auth/refresh-token");

        const token = response.data.accesstoken;

        setApiAccessToken(token);
        setAccessToken(token);

        const meResponse = await api.get("/auth/me");

        setUser(meResponse.data.user);
      } catch (error) {
        setApiAccessToken(null);
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // IF ACCESS TOKEN EXPIRES AND REFRESH ALSO FAILS
  useEffect(() => {
    setAuthFailureHandler(() => {
      setApiAccessToken(null);
      setAccessToken(null);
      setUser(null);
    });

    return () => {
      setAuthFailureHandler(null);
    };
  }, []);

  const isAuthenticated = !!accessToken;

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        loading,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
