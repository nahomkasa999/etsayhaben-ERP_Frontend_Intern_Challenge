"use client";

import { Badge } from "@/shared/components/ui/badge";
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
  isActive: boolean;
  isSelecting: boolean;
  onSelect: (companyId: string) => void | Promise<void>;
};

export function CompanyCard({
  company,
  isActive,
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
        isActive && "ring-2 ring-primary/40",
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
      {isActive ? (
        <Badge variant="secondary" className="absolute top-3 right-3 z-10">
          Active
        </Badge>
      ) : null}
      <CardHeader className="pr-16">
        <CardTitle>{company.name}</CardTitle>
        <CardDescription>@{company.slug}</CardDescription>
      </CardHeader>
    </Card>
  );
}
