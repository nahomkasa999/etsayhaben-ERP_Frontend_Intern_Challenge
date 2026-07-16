import { getCookie } from "hono/cookie";
import type { Context } from "hono";
import prisma from "@/lib/db";
import type { AppVariables } from "@/app/api/types/context";
import { ACTIVE_COMPANY_COOKIE } from "@/modules/company/types/constants";

type AppEnv = { Variables: AppVariables };

export type ActiveCompanyContext =
  | { ok: true; tenantId: string; companyId: string; userId: string }
  | { ok: false; response: Response };

export async function resolveActiveCompany(
  c: Context<AppEnv>,
): Promise<ActiveCompanyContext> {
  const session = c.get("session");
  const user = c.get("user");

  if (!session || !user) {
    return { ok: false, response: c.json({ error: "Unauthorized" }, 401) };
  }

  const tenantId = session.activeOrganizationId;
  if (!tenantId) {
    return {
      ok: false,
      response: c.json({ error: "No active organization selected" }, 400),
    };
  }

  const companyId = getCookie(c, ACTIVE_COMPANY_COOKIE);
  if (!companyId) {
    return {
      ok: false,
      response: c.json({ error: "No active company selected" }, 400),
    };
  }

  const member = await prisma.member.findFirst({
    where: {
      userId: user.id,
      organizationId: tenantId,
    },
  });

  if (!member) {
    return { ok: false, response: c.json({ error: "Forbidden" }, 403) };
  }

  const company = await prisma.company.findFirst({
    where: { id: companyId, organizationId: tenantId },
  });

  if (!company) {
    return { ok: false, response: c.json({ error: "Company not found" }, 404) };
  }

  return { ok: true, tenantId, companyId, userId: user.id };
}
