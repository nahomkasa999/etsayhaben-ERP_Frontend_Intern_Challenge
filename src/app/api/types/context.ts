import type { Member } from "@/generated/prisma/client";
import type { auth } from "@/lib/auth";

export type AuthUser = typeof auth.$Infer.Session.user;

export type AppVariables = {
  user: AuthUser | null;
  session: typeof auth.$Infer.Session.session | null;
};

export function isOrganizationOwner(member: Member) {
  return member.role
    .split(",")
    .map((role) => role.trim())
    .includes("owner");
}
