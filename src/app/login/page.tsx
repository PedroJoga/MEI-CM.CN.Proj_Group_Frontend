"use client"
import { LoginForm } from "@/components/login-form"
import { AuthContext } from '@/contexts/AuthContext';
import { useState } from "react";
import { useContext } from 'react';
import { useRouter } from "next/navigation";

export default function Page() {
  const { signIn } = useContext(AuthContext)
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setError("");
    const success = await signIn({ email, password });

    if (success) {
      router.refresh();
      router.push("/dashboard"); // not needed
    } else {
      setError("Credenciais inválidas");
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm onSubmit={handleLogin} />
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}
