import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  /* Load user from cookie on refresh */
  useEffect(() => {

    const fetchUser = async() => {
      try{
        const {data} = await api.get("/auth/me");
        setUser(data.user);
      }catch{
        setUser(null);
      }
    };

    fetchUser();

  }, []);

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

  const logout = async () => {
    await api.post("/auth/logout")
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