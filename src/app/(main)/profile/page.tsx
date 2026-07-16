"use client";

import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useCompany } from "@/modules/company/hooks/useCompany";
import { useWorkspace } from "@/modules/workspace/hooks/useWorkspace";
import { Building2Icon } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const {
    workspaces,
    activeWorkspace,
    isLoading: isLoadingWorkspaces,
  } = useWorkspace();
  const { activeCompany, isLoading: isLoadingCompanies } = useCompany();

  if (isPending || isLoadingWorkspaces || isLoadingCompanies) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const user = session?.user;
  const name = user?.name || "User";
  const email = user?.email || "—";
  const initials = getInitials(name) || "U";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">
            Your account details and current workspace context.
          </p>
        </div>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/workspace" />}
        >
          <Building2Icon />
          Go to workspaces
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="max-w-none">
          <CardHeader className="flex-row items-center gap-4">
            <Avatar className="size-14">
              <AvatarImage src={user?.image ?? ""} alt={name} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{name}</CardTitle>
              <CardDescription>{email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b pb-2">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{email}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-none">
          <CardHeader>
            <CardTitle>Workspace context</CardTitle>
            <CardDescription>
              Your current organization and company selections.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b pb-2">
              <span className="text-muted-foreground">Current organization</span>
              <span className="font-medium">
                {activeWorkspace?.name ?? "Not selected"}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-b pb-2">
              <span className="text-muted-foreground">Current company</span>
              <span className="font-medium">
                {activeCompany?.name ?? "Not selected"}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-b pb-2">
              <span className="text-muted-foreground">Total organizations</span>
              <span className="font-medium">{workspaces.length}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Total companies</span>
              <span className="font-medium">{workspaces.reduce((sum, w) => sum + w.companyCount, 0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
