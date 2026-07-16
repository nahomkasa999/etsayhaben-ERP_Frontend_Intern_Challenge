"use client";

import Link from "next/link";
import { Building2Icon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { WorkspaceWithCompanies } from "../types";

type OrganizationCardProps = {
  workspace: WorkspaceWithCompanies;
  onSelect: (organizationId: string) => void;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function OrganizationCard({
  workspace,
  onSelect,
}: OrganizationCardProps) {
  const companyLabel =
    workspace.companyCount === 1 ? "1 company" : `${workspace.companyCount} companies`;

  return (
    <Link
      href={`/workspace/${workspace.id}`}
      onClick={() => onSelect(workspace.id)}
      className="block h-full"
    >
      <Card className="relative h-full transition-colors hover:bg-muted/40">
        <CardHeader className="flex-row items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {workspace.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={workspace.logo}
                alt={workspace.name}
                className="size-10 rounded-lg object-cover"
              />
            ) : (
              <span className="text-sm font-semibold">
                {getInitials(workspace.name) || (
                  <Building2Icon className="size-4" />
                )}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">{workspace.name}</CardTitle>
            <CardDescription className="truncate">@{workspace.slug}</CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="mt-auto border-t-0 bg-transparent pt-0">
          <p className="text-sm text-muted-foreground">{companyLabel}</p>
        </CardFooter>
      </Card>
    </Link>
  );
}
