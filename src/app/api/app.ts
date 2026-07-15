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



app.on(["POST", "GET"], "/auth*", (c) => auth.handler(c.req.raw));

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



registerDocs(app);



export { app };


