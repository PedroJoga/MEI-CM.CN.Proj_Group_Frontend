"use client"
import { RegisterForm } from "@/components/register-form"
import { AuthContext } from '@/contexts/AuthContext';
import { useState } from "react";
import { useContext } from 'react';
import { useRouter } from "next/navigation";

export default function Page() {
  const { signUp } = useContext(AuthContext)
  const router = useRouter();
  const [error, setError] = useState("");

  const handleRegister = async (username: string, email: string, password: string) => {
    setError("");
    const success = await signUp({ username, email, password });

    if (success) {
      router.refresh();
      //router.push("/dashboard"); // not needed
    } else {
      setError("Credenciais inválidas");
    }
  };
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm onSubmit={handleRegister} />
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}
