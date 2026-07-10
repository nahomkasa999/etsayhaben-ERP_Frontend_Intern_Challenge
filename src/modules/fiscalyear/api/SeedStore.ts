import { FasicalYear } from "../types";

const SEED_DATA: FasicalYear[] = [
  {
    id: "fy-2022",
    name: "FY 2022",
    startDate: "2022-01-01",
    endDate: "2022-12-31",
    status: "CLOSED",
    isActive: false,
    updatedAt: "2022-12-31T23:59:59.000Z",
  },
  {
    id: "fy-2023",
    name: "FY 2023",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    status: "LOCKED",
    isActive: false,
    updatedAt: "2023-12-31T23:59:59.000Z",
  },
  {
    id: "fy-2024",
    name: "FY 2024",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    status: "CLOSED",
    isActive: false,
    updatedAt: "2024-12-31T23:59:59.000Z",
  },
  {
    id: "fy-2025",
    name: "FY 2025",
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    status: "OPEN",
    isActive: true,
    updatedAt: "2025-01-01T00:00:00.000Z",
  },
  {
    id: "fy-2026",
    name: "FY 2026",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    status: "REOPENED",
    isActive: false,
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

export default SEED_DATA;
