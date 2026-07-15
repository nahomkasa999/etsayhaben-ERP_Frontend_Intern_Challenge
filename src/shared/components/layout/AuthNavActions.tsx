"use client";

import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { CircleUserRoundIcon, Building2Icon, LayoutDashboardIcon, LogOutIcon } from "lucide-react";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function AuthNavActions() {
  const { data: session, isPending } = authClient.useSession();
  const { signOut } = useAuth();

  if (isPending) {
    return <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />;
  }

  if (session?.user) {
    const name = session.user.name || "User";
    const email = session.user.email || "";
    const avatar = session.user.image ?? "";
    const initials = getInitials(name) || "U";

    return (
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          <LayoutDashboardIcon />
          Dashboard
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-9 gap-2 px-2" />
            }
          >
            <Avatar className="size-7">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <span className="hidden max-w-36 truncate text-sm font-medium sm:inline">
              {name}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/profile" />}>
              <CircleUserRoundIcon />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/workspace" />}>
              <Building2Icon />
              Workspaces
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/dashboard" />}>
              <LayoutDashboardIcon />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void signOut()}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" nativeButton={false} render={<Link href="/signin" />}>
        Sign In
      </Button>
      <Button nativeButton={false} render={<Link href="/signup" />}>
        Sign Up
      </Button>
    </div>
  );
}
