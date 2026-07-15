import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const createPrismaClient = () => new PrismaClient({ adapter });

type AppPrismaClient = ReturnType<typeof createPrismaClient>;

declare global {
  var prismaGlobal: undefined | AppPrismaClient;
}

function hasEmployeeDelegate(client: AppPrismaClient) {
  return typeof client.employee?.findMany === "function";
}

const existing = globalThis.prismaGlobal;

// Dev HMR can keep a PrismaClient created before new models were generated.
const prisma =
  existing && hasEmployeeDelegate(existing) ? existing : createPrismaClient();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  if (existing && existing !== prisma) {
    void existing.$disconnect().catch(() => undefined);
  }
  globalThis.prismaGlobal = prisma;
}
