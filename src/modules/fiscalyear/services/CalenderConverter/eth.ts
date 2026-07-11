import { MARKERS, GDate } from "./greg";

export class EthDate {
	year: number;
	month: number;
	day: number;

	constructor(year: number, month: number, day: number) {
		if (year < 0) {
			throw new Error("Year must be positive");
		}
		if (month < 1 || month > 13) {
			throw new Error("Month must be between 1 and 13");
		}
		if (day < 1 || day > 30) {
			throw new Error("Day must be between 1 and 30");
		}

		if (month === 13) {
			if (year % 4 === 3 && day > 6) {
				throw new Error("Month 13 has only 6 days");
			} else if (year % 4 !== 3 && day > 5) {
				throw new Error("Month 13 has only 5 days");
			}
		}

		this.year = year;
		this.month = month;
		this.day = day;
	}

	toGreg(): GDate {
		const term = this.getTerm();
		const day = this.dayOfYear();
		const marker = MARKERS.find(m => m.INDEX === term);

		if (!marker) {
			throw new Error("Invalid term marker");
		}

		let gDayOfYear: number;
		let gYear: number;

		if (term === 4 && day === 366) {
			gDayOfYear = 254;
			gYear = this.year + 8;
		} else if (day <= marker.DAY_OF_YEAR.MID) {
			gDayOfYear = day + marker.DAY_OF_YEAR.START - 1;
			gYear = this.year + 7;
		} else {
			gDayOfYear = day - marker.DAY_OF_YEAR.MID + 1;
			gYear = this.year + 8;
		}

		return GDate.fromDayOfYear(gDayOfYear, gYear);
	}

	toString(): string {
		return `${this.year}-${this.month}-${this.day}`;
	}

	getTerm(): number {
		return this.year % 4 + 1;
	}

	dayOfYear(): number {
		let days = 0;
		for (let i = 1; i < this.month; i++) {
			days += 30;
		}
		days += this.day;
		return days;
	}

	static dayCount(month: number, year: number): number {
		if (month === 13) {
			return year % 4 === 3 ? 6 : 5;
		}
		return 30;
	}

	static fromDayOfYear(dayOfYear: number, _year: number): EthDate {
		let month = 1;
		let day = dayOfYear;
		let year = _year;

		if (_year % 4 === 3 && dayOfYear > 366) {
			year += 1;
			day -= 366;
		} else if (_year % 4 !== 3 && dayOfYear > 365) {
			year += 1;
			day -= 365;
		}

		while (day > EthDate.dayCount(month, year)) {
			day -= EthDate.dayCount(month, year);
			month++;
		}

		return new EthDate(year, month, day);
	}
}
