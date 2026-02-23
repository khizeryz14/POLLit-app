import { createContext, useContext, useEffect, useState } from "react";

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

  /* Mock login */
  const login = async (email) => {
    await new Promise(r => setTimeout(r, 400)); // fake latency

    const fakeUser = {
      id: Date.now(),
      name: email.split("@")[0],
      email,
    };

    setUser(fakeUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}