import { Hono } from "hono";
import { handle } from "hono/vercel";
import { auth } from "@/lib/auth";
import { fiscalYearApp } from "@/modules/fiscalyear/api/route";

const app = new Hono().basePath("/api/v1");

app.on(["POST", "GET"], "/api/v1/auth*", (c) => auth.handler(c.req.raw));

app.route("/fiscalyear", fiscalYearApp);
// Example endpoint: hits /api/health
app.get("/health", (c) => c.json({ status: "ok" }));

// Export methods for Next.js to handle incoming requests
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
