const MARKERS = [
  { INDEX: 1, DAY_OF_YEAR: { START: 255, MID: 112 }, START: { MONTH: 9, DAY: 12, YEAR: 3 }, END: { MONTH: 9, DAY: 10, YEAR: 0 } },
  { INDEX: 2, DAY_OF_YEAR: { START: 255, MID: 113 }, START: { MONTH: 9, DAY: 11, YEAR: 0 }, END: { MONTH: 9, DAY: 10, YEAR: 1 } },
  { INDEX: 3, DAY_OF_YEAR: { START: 254, MID: 113 }, START: { MONTH: 9, DAY: 11, YEAR: 1 }, END: { MONTH: 9, DAY: 10, YEAR: 2 } },
  { INDEX: 4, DAY_OF_YEAR: { START: 254, MID: 113 }, START: { MONTH: 9, DAY: 11, YEAR: 2 }, END: { MONTH: 9, DAY: 11, YEAR: 3 } },
];

const GREG_DAY_COUNT = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function ethDayCount(month: number, year: number): number {
  return month === 13 ? (year % 4 === 3 ? 6 : 5) : 30;
}

function gregDayCount(month: number, year: number): number {
  return month === 0 && year % 4 === 0 ? 29 : GREG_DAY_COUNT[month] ?? 0;
}

function ethDayOfYear(month: number, day: number): number {
  return (month - 1) * 30 + day;
}

function ethFromDayOfYear(dayOfYear: number, year: number): { year: number; month: number; day: number } {
  let month = 1, day = dayOfYear, y = year;
  if (y % 4 === 3 && dayOfYear > 366) { y++; day -= 366; }
  else if (y % 4 !== 3 && dayOfYear > 365) { y++; day -= 365; }
  while (day > ethDayCount(month, y)) { day -= ethDayCount(month, y); month++; }
  return { year: y, month, day };
}

function gregFromDayOfYear(dayOfYear: number, year: number): Date {
  let month = 0, day = dayOfYear;
  while (day > gregDayCount(month, year)) { day -= gregDayCount(month, year); month++; }
  return new Date(year, month, day);
}

function ethToGreg(year: number, month: number, day: number): Date {
  const term = year % 4 + 1;
  const doy = ethDayOfYear(month, day);
  const marker = MARKERS.find(m => m.INDEX === term)!;
  let gDayOfYear: number, gYear: number;
  if (term === 4 && doy === 366) { gDayOfYear = 254; gYear = year + 8; }
  else if (doy <= marker.DAY_OF_YEAR.MID) { gDayOfYear = doy + marker.DAY_OF_YEAR.START - 1; gYear = year + 7; }
  else { gDayOfYear = doy - marker.DAY_OF_YEAR.MID + 1; gYear = year + 8; }
  return gregFromDayOfYear(gDayOfYear, gYear);
}

function gregToEth(date: Date): { year: number; month: number; day: number } {
  const yearMod = date.getFullYear() % 4;
  const term = yearMod + 1;
  const doy = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000) + 1;
  const marker = MARKERS.find(m => m.INDEX === term)!;
  if (term === 4 && doy === 254) return ethFromDayOfYear(366, date.getFullYear() - 8);
  if (doy >= marker.DAY_OF_YEAR.START) return ethFromDayOfYear(doy - marker.DAY_OF_YEAR.START + 1, date.getFullYear() - 7);
  return ethFromDayOfYear(doy + marker.DAY_OF_YEAR.MID - 1, date.getFullYear() - 8);
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function ethiopianToGregorian(ethDateStr: string): string {
  const [day, month, year] = ethDateStr.split("-").map(Number);
  const g = ethToGreg(year, month, day);
  return `${g.getFullYear()}-${pad(g.getMonth() + 1)}-${pad(g.getDate())}`;
}

function gregorianToEthiopian(greDateStr: string): string {
  const [year, month, day] = greDateStr.split("-").map(Number);
  const e = gregToEth(new Date(`${year}-${pad(month)}-${pad(day)}`));
  return `${pad(e.day)}-${pad(e.month)}-${e.year}`;
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
