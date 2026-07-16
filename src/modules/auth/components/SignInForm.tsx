"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { SignInSchema as signInSchema } from "@/modules/auth/types";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { formatFieldErrors } from "@/shared/lib/form-errors";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";

export default function SignInForm() {
  const { signIn, isLoading, error, setError } = useAuth();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      await signIn({
        email: value.email,
        password: value.password,
      });
    },
  });

  return (
    <Card className="z-10 w-full">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              form.handleSubmit();
            }}
            className="flex flex-col gap-4"
            method="POST"
            autoComplete="off"
          >
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      placeholder="email@address.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <p className="text-sm text-destructive">
                        {formatFieldErrors(field.state.meta.errors)}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <form.Field
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Password</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <p className="text-sm text-destructive">
                        {formatFieldErrors(field.state.meta.errors)}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <form.Subscribe
              selector={(state) => [state.isSubmitting]}
              children={([isSubmitting]) => (
                <div className="flex flex-col gap-2">
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || isLoading}
                  >
                    {isSubmitting || isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </div>
              )}
            />
            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary underline"
              >
                Sign Up
              </Link>
            </p>
          </form>
        </CardContent>
    </Card>
  );
}
