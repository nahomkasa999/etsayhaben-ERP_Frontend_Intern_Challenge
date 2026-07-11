import { EthDate } from "./eth";
import { GDate } from "./greg";

function parseEthiopianDateString(dateStr: string): EthDate {
  const [day, month, year] = dateStr.split("-").map(Number);
  if (!day || !month || !year) {
    throw new Error(
      `Invalid Ethiopian date string: "${dateStr}". Expected DD-MM-YYYY.`,
    );
  }
  return new EthDate(year, month, day);
}

function parseGregorianDateString(dateStr: string): GDate {
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!day || !month || !year) {
    throw new Error(
      `Invalid Gregorian date string: "${dateStr}". Expected YYYY-MM-DD.`,
    );
  }
  return new GDate(
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  );
}

export function ethiopianToGregorian(ethDateStr: string): string {
  const eth = parseEthiopianDateString(ethDateStr);
  const g = eth.toGreg();
  return `${g.getFullYear()}-${String(g.getMonth() + 1).padStart(2, "0")}-${String(g.getDate()).padStart(2, "0")}`;
}

export function gregorianToEthiopian(greDateStr: string): string {
  const gre = parseGregorianDateString(greDateStr);
  const e = gre.toEth();
  return `${String(e.day).padStart(2, "0")}-${String(e.month).padStart(2, "0")}-${e.year}`;
}

export function deriveFiscalYearDates(
  calendarType: "ETHIOPIAN" | "GREGORIAN",
  startDate: string,
  endDate: string,
): {
  start_date_eth: string;
  start_date_gre: string;
  end_date_eth: string;
  end_date_gre: string;
} {
  if (calendarType === "ETHIOPIAN") {
    return {
      start_date_eth: startDate,
      start_date_gre: ethiopianToGregorian(startDate),
      end_date_eth: endDate,
      end_date_gre: ethiopianToGregorian(endDate),
    };
  } else {
    return {
      start_date_eth: gregorianToEthiopian(startDate),
      start_date_gre: startDate,
      end_date_eth: gregorianToEthiopian(endDate),
      end_date_gre: endDate,
    };
  }
}
