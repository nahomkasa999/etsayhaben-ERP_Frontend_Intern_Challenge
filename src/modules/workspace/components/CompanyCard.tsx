"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/lib/utils";
import type { Company } from "@/modules/company/types";

type CompanyCardProps = {
  company: Company;
  isSelecting: boolean;
  onSelect: (companyId: string) => void | Promise<void>;
};

export function CompanyCard({
  company,
  isSelecting,
  onSelect,
}: CompanyCardProps) {
  return (
    <Card
      role="button"
      tabIndex={isSelecting ? -1 : 0}
      aria-disabled={isSelecting}
      className={cn(
        "relative h-full cursor-pointer transition-colors hover:bg-muted/40",
        isSelecting && "pointer-events-none opacity-70",
      )}
      onClick={() => {
        if (isSelecting) {
          return;
        }
        void onSelect(company.id);
      }}
      onKeyDown={(event) => {
        if (isSelecting) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          void onSelect(company.id);
        }
      }}
    >
      <CardHeader>
        <CardTitle>{company.name}</CardTitle>
        <CardDescription>@{company.slug}</CardDescription>
      </CardHeader>
    </Card>
  );
}
