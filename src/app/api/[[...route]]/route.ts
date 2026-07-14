import { Hono } from "hono";
import { handle } from "hono/vercel";
import { fiscalYearApp } from "@/modules/fiscalyear/api/route";

const app = new Hono().basePath("/api/v1");

app.route("/fiscalyear", fiscalYearApp);
// Example endpoint: hits /api/health
app.get("/health", (c) => c.json({ status: "ok" }));

// Export methods for Next.js to handle incoming requests
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
