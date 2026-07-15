import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import type { AppVariables } from "../types/context";

export const requireSession = createMiddleware<{
  Variables: Pick<AppVariables, "session">;
}>(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("session", session);
  await next();
});

export const requireOrganization = createMiddleware<{
  Variables: AppVariables;
}>(async (c, next) => {
  const session = c.get("session");
  const organizationId = session.session.activeOrganizationId;

  if (!organizationId) {
    return c.json({ error: "No active organization selected" }, 400);
  }

  const member = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      organizationId,
    },
  });

  if (!member) {
    return c.json({ error: "Forbidden" }, 403);
  }

  c.set("organizationId", organizationId);
  c.set("member", member);
  await next();
});
