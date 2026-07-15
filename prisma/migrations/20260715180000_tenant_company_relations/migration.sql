-- Align fiscal year tenant and audit columns with Better Auth text IDs
ALTER TABLE "fiscal_years" ALTER COLUMN "tenant_id" TYPE TEXT USING "tenant_id"::text;
ALTER TABLE "fiscal_years" ALTER COLUMN "created_by" TYPE TEXT USING "created_by"::text;
ALTER TABLE "fiscal_years" ALTER COLUMN "activated_by" TYPE TEXT USING "activated_by"::text;
ALTER TABLE "fiscal_years" ALTER COLUMN "updated_by" TYPE TEXT USING "updated_by"::text;
ALTER TABLE "fiscal_years" ALTER COLUMN "closed_by" TYPE TEXT USING "closed_by"::text;
ALTER TABLE "fiscal_years" ALTER COLUMN "reopened_by" TYPE TEXT USING "reopened_by"::text;

-- Link companies to organizations
ALTER TABLE "companies"
ADD CONSTRAINT "companies_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
