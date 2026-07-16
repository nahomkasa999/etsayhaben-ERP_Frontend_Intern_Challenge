"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "../store/authStore";
import type { AuthUser } from "../types";

function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    role: user.role ?? "user",
  };
}

export function useAuth() {
  const router = useRouter();
  const { setUser, logout: clearUser } = useAuthStore();
  const { data: session } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = session?.user ? toAuthUser(session.user) : null;

  async function signUp(values: {
    name: string;
    email: string;
    password: string;
  }) {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      if (authError) {
        setError(authError.message ?? "Sign up failed");
        return false;
      }

      if (data?.user) {
        setUser(toAuthUser(data.user));
      }

      router.push("/dashboard");
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(values: { email: string; password: string }) {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (authError) {
        setError(authError.message ?? "Sign in failed");
        return false;
      }

      if (data?.user) {
        setUser(toAuthUser(data.user));
      }

      router.push("/dashboard");
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.signOut();
      clearUser();
      router.push("/signin");
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign out failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  return {
    user,
    isLoading,
    error,
    setError,
    signUp,
    signIn,
    signOut,
  };
}
