import { Hono } from "hono";

export const fiscalYearApp = new Hono();

fiscalYearApp.get("/", (c) => {
  return c.json({ message: "Fetching all fiscal years" });
});

fiscalYearApp.post("/create", (c) => {
  return c.json({ message: "Fiscal year created" });
});
