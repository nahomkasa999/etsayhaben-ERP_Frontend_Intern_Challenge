"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useCompany } from "../hooks/useCompany";

type CreateCompanyFormProps = {
  onSuccess?: () => void;
  submitLabel?: string;
};

export function CreateCompanyForm({
  onSuccess,
  submitLabel = "Create company",
}: CreateCompanyFormProps) {
  const { createCompany, isMutating, error } = useCompany();
  const [name, setName] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await createCompany({ name });
    setName("");
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="company-name">Company name</Label>
        <Input
          id="company-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Acme Trading PLC"
          required
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={isMutating || !name.trim()}>
        {isMutating ? "Creating..." : submitLabel}
      </Button>
    </form>
  );
}
