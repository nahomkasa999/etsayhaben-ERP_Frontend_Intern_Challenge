import { OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "@/lib/auth";
import { healthApp } from "./routes/health";
import { registerDocs } from "./routes/docs";
import { companyApp } from "@/modules/company/api/routes/route";

const app = new OpenAPIHono().basePath("/api/v1");

app.on(["POST", "GET"], "/auth*", (c) => auth.handler(c.req.raw));
app.route("/health", healthApp);
app.route("/companies", companyApp);

registerDocs(app);

export { app };
