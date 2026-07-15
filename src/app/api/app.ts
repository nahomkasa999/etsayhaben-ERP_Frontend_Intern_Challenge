import { OpenAPIHono } from "@hono/zod-openapi";

import { auth } from "@/lib/auth";

import type { AppVariables } from "./types/context";

import { healthApp } from "./routes/health";

import { registerDocs } from "./routes/docs";

import {
  createCompanyHandler,
  createCompanyRoute,
  deleteCompanyHandler,
  deleteCompanyRoute,
  getCompanyHandler,
  getCompanyRoute,
  listCompaniesHandler,
  listCompaniesRoute,
  selectCompanyHandler,
  selectCompanyRoute,
  updateCompanyHandler,
  updateCompanyRoute,
} from "@/modules/company/api/routes/route";

import {
  createOrganizationHandler,
  createOrganizationRoute,
  listOrganizationsHandler,
  listOrganizationsRoute,
  setActiveOrganizationHandler,
  setActiveOrganizationRoute,
} from "@/modules/workspace/api/routes/route";

import {
  activateFiscalYearHandler,
  activateFiscalYearRoute,
  closeFiscalYearHandler,
  closeFiscalYearRoute,
  createFiscalYearHandler,
  createFiscalYearRoute,
  deleteFiscalYearHandler,
  deleteFiscalYearRoute,
  getActiveFiscalYearHandler,
  getActiveFiscalYearRoute,
  getFiscalYearByDateHandler,
  getFiscalYearByDateRoute,
  getFiscalYearHandler,
  getFiscalYearRoute,
  listFiscalYearsHandler,
  listFiscalYearsRoute,
  reopenFiscalYearHandler,
  reopenFiscalYearRoute,
  updateFiscalYearHandler,
  updateFiscalYearRoute,
} from "@/modules/fiscalyear/api/routes/route";

import {
  createInventoryItemHandler,
  createInventoryItemRoute,
  deleteInventoryItemHandler,
  deleteInventoryItemRoute,
  getInventoryItemHandler,
  getInventoryItemRoute,
  listInventoryItemsHandler,
  listInventoryItemsRoute,
  updateInventoryItemHandler,
  updateInventoryItemRoute,
} from "@/modules/inventory/api/routes/route";

import {
  createEmployeeHandler,
  createEmployeeRoute,
  deleteEmployeeHandler,
  deleteEmployeeRoute,
  getEmployeeHandler,
  getEmployeeRoute,
  listEmployeesHandler,
  listEmployeesRoute,
  updateEmployeeHandler,
  updateEmployeeRoute,
} from "@/modules/hr/api/routes/route";

const app = new OpenAPIHono<{ Variables: AppVariables }>().basePath("/api/v1");

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

app.route("/health", healthApp);

app.openapi(listOrganizationsRoute, listOrganizationsHandler);
app.openapi(createOrganizationRoute, createOrganizationHandler);
app.openapi(setActiveOrganizationRoute, setActiveOrganizationHandler);

app.openapi(listCompaniesRoute, listCompaniesHandler);
app.openapi(createCompanyRoute, createCompanyHandler);
app.openapi(getCompanyRoute, getCompanyHandler);
app.openapi(updateCompanyRoute, updateCompanyHandler);
app.openapi(deleteCompanyRoute, deleteCompanyHandler);
app.openapi(selectCompanyRoute, selectCompanyHandler);

app.openapi(listFiscalYearsRoute, listFiscalYearsHandler as never);
app.openapi(getActiveFiscalYearRoute, getActiveFiscalYearHandler as never);
app.openapi(getFiscalYearByDateRoute, getFiscalYearByDateHandler as never);
app.openapi(getFiscalYearRoute, getFiscalYearHandler as never);
app.openapi(createFiscalYearRoute, createFiscalYearHandler as never);
app.openapi(updateFiscalYearRoute, updateFiscalYearHandler as never);
app.openapi(activateFiscalYearRoute, activateFiscalYearHandler as never);
app.openapi(closeFiscalYearRoute, closeFiscalYearHandler as never);
app.openapi(reopenFiscalYearRoute, reopenFiscalYearHandler as never);
app.openapi(deleteFiscalYearRoute, deleteFiscalYearHandler as never);

app.openapi(listInventoryItemsRoute, listInventoryItemsHandler as never);
app.openapi(getInventoryItemRoute, getInventoryItemHandler as never);
app.openapi(createInventoryItemRoute, createInventoryItemHandler as never);
app.openapi(updateInventoryItemRoute, updateInventoryItemHandler as never);
app.openapi(deleteInventoryItemRoute, deleteInventoryItemHandler as never);

app.openapi(listEmployeesRoute, listEmployeesHandler as never);
app.openapi(getEmployeeRoute, getEmployeeHandler as never);
app.openapi(createEmployeeRoute, createEmployeeHandler as never);
app.openapi(updateEmployeeRoute, updateEmployeeHandler as never);
app.openapi(deleteEmployeeRoute, deleteEmployeeHandler as never);

registerDocs(app);

export { app };
