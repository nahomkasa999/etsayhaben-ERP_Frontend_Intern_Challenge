import { useForm } from "@tanstack/react-form";

import {
  CreateFiscalYearSchema,
  type FiscalYearFormValues,
} from "../types";

export const fiscalYearDefaultValues: FiscalYearFormValues = {
  fiscalYearName: "",
  calendarType: "ETHIOPIAN",
  startDate: "",
  endDate: "",
};

export function useFiscalYearForm(options: {
  defaultValues?: FiscalYearFormValues;
  onSubmit: (value: FiscalYearFormValues) => Promise<void>;
}) {
  return useForm({
    defaultValues: options.defaultValues ?? fiscalYearDefaultValues,
    validators: {
      onSubmit: CreateFiscalYearSchema,
    },
    onSubmit: async ({ value }) => {
      await options.onSubmit(value);
    },
  });
}

export type FiscalYearFormApi = ReturnType<typeof useFiscalYearForm>;
