"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { SignUpSchema as signUpSchema } from "@/modules/auth/types";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { formatFieldErrors } from "@/shared/lib/form-errors";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function SignUpForm() {
  const { signUp, isLoading, error, setError } = useAuth();

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      await signUp({
        name: value.name,
        email: value.email,
        password: value.password,
      });
    },
  });

  return (
    <Card className="z-10 w-full">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create an account</CardDescription>
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
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Full name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      placeholder="John Doe"
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
                      autoComplete="new-password"
                      placeholder="....."
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
              name="confirmPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor={field.name}>Confirm Password</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      placeholder="....."
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
                    {isSubmitting || isLoading
                      ? "Creating account..."
                      : "Sign Up"}
                  </Button>
                </div>
              )}
            />
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-primary underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
    </Card>
  );
}
