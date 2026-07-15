"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PackageIcon, UsersIcon } from "lucide-react";

import { fetchInventoryItems } from "@/modules/inventory/hooks/useInventory";
import { useInventoryFilterStore } from "@/modules/inventory/store/inventoryFilterStore";

import { fetchEmployees } from "@/modules/hr/hooks/useEmployees";
import { useDepartmentFilterStore } from "@/modules/hr/store/departmentFilterStore";

import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

const CATEGORIES = ["Stationery", "Electronics", "Furniture", "Other"];
const DEPARTMENTS = ["Store", "Engineering", "Finance", "Marketing"];

export default function DashboardPage() {
  const { data: items = [] } = useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventoryItems,
  });

  const selectedCategory = useInventoryFilterStore((s) => s.selectedCategory);
  const setCategory = useInventoryFilterStore((s) => s.setCategory);

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category === selectedCategory)
    : items;

  const inventoryCount = filteredItems.length;
  const lowStockCount = filteredItems.filter(
    (item) => item.quantity < item.reorderLevel,
  ).length;

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const selectedDepartment = useDepartmentFilterStore(
    (s) => s.selectedDepartment,
  );
  const setDepartment = useDepartmentFilterStore((s) => s.setDepartment);

  const filteredEmployees = selectedDepartment
    ? employees.filter(
        (employee) => employee.department === selectedDepartment,
      )
    : employees;

  const employeeCount = filteredEmployees.length;
  const employeesOnLeave = filteredEmployees.filter(
    (employee) => employee.status === "on_leave",
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of inventory and human resources.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        <Card className="@container/card">
          <CardHeader className="grid-cols-[auto_1fr_auto] items-start gap-x-3">
            <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
              <PackageIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="mb-0.5">
                <Select
                  value={selectedCategory ?? "all"}
                  onValueChange={(value) =>
                    setCategory(!value || value === "all" ? null : value)
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="h-auto w-auto gap-1 border-0 bg-transparent p-0 text-base font-medium shadow-none focus-visible:ring-0 dark:bg-transparent"
                  >
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="all">All categories</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardTitle>
              <CardDescription>Items in inventory</CardDescription>
            </div>
            <Badge variant={lowStockCount > 0 ? "destructive" : "secondary"}>
              {lowStockCount} stock
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold tabular-nums tracking-tight">
              {inventoryCount}
            </p>
            <Link
              href="/inventory"
              className="mt-2 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              View inventory
            </Link>
          </CardContent>
        </Card>

        <Card className="@container/card">
          <CardHeader className="grid-cols-[auto_1fr_auto] items-start gap-x-3">
            <div className="bg-muted flex size-10 items-center justify-center rounded-lg">
              <UsersIcon className="size-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="mb-0.5">
                <Select
                  value={selectedDepartment ?? "all"}
                  onValueChange={(value) =>
                    setDepartment(!value || value === "all" ? null : value)
                  }
                >
                  <SelectTrigger
                    size="sm"
                    className="h-auto w-auto gap-1 border-0 bg-transparent p-0 text-base font-medium shadow-none focus-visible:ring-0 dark:bg-transparent"
                  >
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="all">All departments</SelectItem>
                    {DEPARTMENTS.map((department) => (
                      <SelectItem key={department} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardTitle>
              <CardDescription>Employees</CardDescription>
            </div>
            <Badge variant="secondary">{employeesOnLeave} on leave</Badge>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold tabular-nums tracking-tight">
              {employeeCount}
            </p>
            <Link
              href="/hr"
              className="mt-2 inline-block text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              View HR
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
