import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  /* Load user from localStorage on refresh */
  useEffect(() => {
    const storedUser = localStorage.getItem("pollit_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  /* Persist user */
  useEffect(() => {
    if (user) {
      localStorage.setItem("pollit_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("pollit_user");
    }
  }, [user]);

  /* LOGIN */
  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", {
      email,
      password,
    });

    setUser(data.user);
  };

  /* REGISTER → auto login */
  const register = async (username, email, password) => {
    try{
    const { data } = await api.post("/auth/register", {
      username,
      email,
      password,
    });

    setUser(data.user);
  }
  catch(err){
    console.log(err.response)
    throw err;
  }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}