import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  basePath: "/api/v1/auth",
  plugins: [organizationClient()],
});
