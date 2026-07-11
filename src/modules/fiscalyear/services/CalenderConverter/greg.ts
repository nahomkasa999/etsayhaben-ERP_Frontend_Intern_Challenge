import { EthDate } from "./eth";

export const MARKERS = [
	{
		INDEX: 1,
		DAY_OF_YEAR: {
			START: 255,
			MID: 112,
		},
		START: {
			MONTH: 9,
			DAY: 12,
			YEAR: 3,
		},
		END: {
			MONTH: 9,
			DAY: 10,
			YEAR: 0,
		}
	},
	{
		INDEX: 2,
		DAY_OF_YEAR: {
			START: 255,
			MID: 113,
		},
		START: {
			MONTH: 9,
			DAY: 11,
			YEAR: 0,
		},
		END: {
			MONTH: 9,
			DAY: 10,
			YEAR: 1,
		}
	},
	{
		INDEX: 3,
		DAY_OF_YEAR: {
			START: 254,
			MID: 113,
		},
		START: {
			MONTH: 9,
			DAY: 11,
			YEAR: 1,
		},
		END: {
			MONTH: 9,
			DAY: 10,
			YEAR: 2,
		}
	},
	{
		INDEX: 4,
		DAY_OF_YEAR: {
			START: 254,
			MID: 113,
		},
		START: {
			MONTH: 9,
			DAY: 11,
			YEAR: 2,
		},
		END: {
			MONTH: 9,
			DAY: 11,
			YEAR: 3,
		}
	}
];

export class GDate extends Date {
	static DAY_COUNT = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

	constructor(dateString: string) {
		super(dateString);
	}

	toEth(): EthDate {
		const term = this.getTerm();
		const thisday = this.dayOfYear();

		const marker = MARKERS.find(m => m.INDEX === term);
		if (!marker) {
			throw new Error("Invalid term");
		}

		if (term === 4 && thisday === 254) {
			return EthDate.fromDayOfYear(366, this.getFullYear() - 8);
		}

		if (thisday >= marker.DAY_OF_YEAR.START) {
			const d = thisday - marker.DAY_OF_YEAR.START + 1;
			const y = this.getFullYear() - 7;
			return EthDate.fromDayOfYear(d, y);
		} else {
			const d = thisday + marker.DAY_OF_YEAR.MID - 1;
			const y = this.getFullYear() - 8;
			return EthDate.fromDayOfYear(d, y);
		}
	}

	getTerm(): number {
		return this.getTermFromMarkers();
	}

	static dayCount(month: number, year: number): number {
		return month === 1 && year % 4 === 0 ? 29 : GDate.DAY_COUNT[month];
	}

	static fromDayOfYear(dayOfYear: number, year: number): GDate {
		let month = 0;
		let day = dayOfYear;

		while (day > GDate.dayCount(month, year)) {
			day -= GDate.dayCount(month, year);
			month++;
		}

		return new GDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
	}

	getTermFromMarkers(): number {
		const year = this.getFullYear() % 4;
		const day = this.getDate();
		const month = this.getMonth() + 1;
		const thisDate = new Date(year, month - 1, day);

		for (const marker of MARKERS) {
			const startDate = new Date(marker.START.YEAR, marker.START.MONTH - 1, marker.START.DAY);
			const endDate = new Date(marker.END.YEAR, marker.END.MONTH - 1, marker.END.DAY);

			const isAfterStart = thisDate >= startDate;
			const isBeforeEnd = thisDate <= endDate;

			if (marker.INDEX === 1 && (isAfterStart || isBeforeEnd)) {
				return marker.INDEX;
			} else if (marker.INDEX !== 1 && (isAfterStart && isBeforeEnd)) {
				return marker.INDEX;
			}
		}

		return -1;
	}

	dayOfYear(): number {
		const year = this.getFullYear();
		const start = new Date(year, 0, 1);
		const current = new Date(year, this.getMonth(), this.getDate());
		const diff = current.getTime() - start.getTime();
		return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
	}
}
