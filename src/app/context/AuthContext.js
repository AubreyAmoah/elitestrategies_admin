"use client";
import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import Loading from "../components/Loading";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onLogin = async (username, password) => {
    setLoading(true);
    if (!username) toast.error("Please provide a username");
    if (!password) toast.error("Please provide a password");
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_URL}/api/auth/signin`,
        { username, password },
        { withCredentials: true }
      );

      if (res.status === 200) setUser(true);
      router.push("/pages/dashboard");
    } catch (error) {
      console.error(error);
      return toast.error(error?.response?.data?.error || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    setLoading(true);
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_URL}/api/auth/logout`);
      toast.success("Logout Success!");
      return router.push("/");
    } catch (error) {
      console.error(error);
      return toast.error(error?.response?.data?.error | "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, onLogin, onLogout, loading }}>
      {loading ? <Loading /> : children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
