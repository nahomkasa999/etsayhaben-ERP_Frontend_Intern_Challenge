-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('Stationery', 'Electronics', 'Furniture', 'Other');
CREATE TYPE "InventoryUnit" AS ENUM ('pcs', 'box', 'kg', 'liter');
CREATE TYPE "InventoryItemStatus" AS ENUM ('active', 'inactive');
CREATE TYPE "EmployeeDepartment" AS ENUM ('Store', 'Engineering', 'Finance', 'Marketing');
CREATE TYPE "EmployeeStatus" AS ENUM ('active', 'on_leave');

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "category" "InventoryCategory" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" "InventoryUnit" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "reorderLevel" INTEGER NOT NULL,
    "status" "InventoryItemStatus" NOT NULL DEFAULT 'active',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" "EmployeeDepartment" NOT NULL,
    "status" "EmployeeStatus" NOT NULL DEFAULT 'active',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inventory_items_companyId_idx" ON "inventory_items"("companyId");
CREATE UNIQUE INDEX "inventory_items_companyId_sku_key" ON "inventory_items"("companyId", "sku");

-- CreateIndex
CREATE INDEX "employees_companyId_idx" ON "employees"("companyId");
CREATE UNIQUE INDEX "employees_companyId_email_key" ON "employees"("companyId", "email");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "employees" ADD CONSTRAINT "employees_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
