"use client";
import { createContext, useState, ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, setAuthToken } from "../services/api";
import { setCookie, parseCookies, destroyCookie } from "nookies";

type User = {
  username: string;
  email: string;
  avatar_url: string;
};

type SignInData = {
  email: string;
  password: string;
};

type SignUpData = {
    username: string;
    email: string;
    password: string;
  };

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (data: SignInData) => Promise<boolean>;
  signUp: (data: SignUpData) => Promise<boolean>;
  signOut: () => void;
};

export const AuthContext = createContext({} as AuthContextType);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    const { "echochat.token": token } = parseCookies();

    if (token) {
      setAuthToken(token); // define o token nos headers

      api
        .get("/users/me")
        .then((response) => {
          setUser({
            username: response.data.username,
            email: response.data.email,
            avatar_url: response.data.userPhotoLink,
          });
        })
        .catch(() => {
          setUser(null);
        });
    }
  }, []);

  async function signIn({ email, password }: SignInData): Promise<boolean> {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      setCookie(undefined, "echochat.token", token, {
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      setAuthToken(token);
      setUser(user);

      return true;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return false;
    }
  }

  async function signUp({ username, email, password }: SignUpData): Promise<boolean> {
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password
      });
  
      const { token, user } = response.data;
  
      setCookie(undefined, "echochat.token", token, {
        maxAge: 60 * 60 * 24, // 24 horas
        path: "/"
      });
  
      setAuthToken(token);
      setUser(user);
  
      return true;
    } catch (error) {
      console.error("Erro ao fazer registro:", error);
      return false;
    }
  }
  

  function signOut() {
    destroyCookie(undefined, "echochat.token");
    setUser(null);
    router.refresh();
    //router.push("/login"); // not needed
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}
