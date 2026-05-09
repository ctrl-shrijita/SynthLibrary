import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login: async (payload) => {
        const res = await api.post("/api/auth/login", payload);
        setUser(res.data.user);
        return res.data.user;
      },
      register: async (payload) => {
        const res = await api.post("/api/auth/register", payload);
        return res.data;
      },
      verifyRegistrationOtp: async (payload) => {
        const res = await api.post("/api/auth/verify-registration-otp", payload);
        setUser(res.data.user);
        return res.data.user;
      },
      resendRegistrationOtp: async (payload) => {
        const res = await api.post("/api/auth/resend-registration-otp", payload);
        return res.data;
      },
      logout: async () => {
        await api.post("/api/auth/logout");
        setUser(null);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
