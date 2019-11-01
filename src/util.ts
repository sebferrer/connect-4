export class TrimResult {
	constructor(
		public top: number = 0,
		public bottom: number = 0,
		public left: number = 0,
		public right: number = 0
	) { }
}

export class ArrayUtil {
	public static getIndex<T>(array: Array<T>, obj: T): number {
		let index = -1;
		let i = 0;
		while (index === -1 && i < array.length) {
			if (array[i] === obj) {
				index = i;
			}
			i++;
		}
		return index;
	}

	public static removeFromArray<T>(array: Array<T>, obj: T): boolean {
		if (array.indexOf(obj) >= 0) {
			array.splice(this.getIndex(array, obj), 1);
			return true;
		}
		return false;
	}

	public static addNoDuplicate<T>(array: Array<T>, obj: T): boolean {
		if (!(array.indexOf(obj) >= 0)) {
			array.push(obj);
			return true;
		}
		return false;
    }
    
    public static addFirstNoDuplicate<T>(array: Array<T>, obj: T): boolean {
		if (!(array.indexOf(obj) >= 0)) {
			array.unshift(obj);
			return true;
		}
		return false;
	}

	public static diff<T>(array1: Array<T>, array2: Array<T>): Array<T> {
		return array1.filter(item => array2.indexOf(item) < 0);
	}

	public static findNbConnected(x: number, y: number, array: Array<Array<number>>): number {
		const canUp = (x - 1 >= 0);
		const canDown = (x + 1 < array.length);
		const canRight = (y + 1 < array[0].length);
		const canLeft = (y - 1 >= 0);

		const value = array[x][y];

		let up = 0;
		let down = 0;
		let right = 0;
		let left = 0;

		array[x][y] = 2;

		if (canUp && array[x - 1][y] === value) {
			up = this.findNbConnected(x - 1, y, array);
		}
		if (canDown && array[x + 1][y] === value) {
			down = this.findNbConnected(x + 1, y, array);
		}
		if (canLeft && array[x][y - 1] === value) {
			left = this.findNbConnected(x, y - 1, array);
		}
		if (canRight && array[x][y + 1] === value) {
			right = this.findNbConnected(x, y + 1, array);
		}

		return up + left + right + down + 1;
	}

	/** Trims a 2D array by removing all the falsy values on each side of the array */
	public static trim<T>(array: T[][]): TrimResult {
		const result = new TrimResult();

		// TOP
		while (!array[0].find(cell => !!cell)) {
			++result.top;
			array.splice(0, 1);
		}
		// BOTTOM
		while (!array[array.length - 1].find(cell => !!cell)) {
			++result.bottom;
			array.splice(array.length - 1, 1);
		}
		// LEFT
		while (!array.find(line => !!line[0])) {
			++result.left;
			for (let y = 0; y < array.length; ++y) {
				array[y].splice(0, 1);
			}
		}
		// RIGHT
		while (!array.find(line => !!line[line.length - 1])) {
			++result.right;
			for (let y = 0; y < array.length; ++y) {
				array[y].splice(array[y].length - 1, 1);
			}
		}
		return result;
	}
}

export class SetUtil {
	public static removeFromArray<T>(set: Set<T>, obj: T): boolean {
		if (set.has(obj)) {
			set.delete(obj);
			return true;
		}
		return false;
	}

	public static addFirstNoDuplicate<T>(set: Set<T>, obj: T): boolean {
		if (!(set.has(obj))) {
			set.add(obj);
			return true;
		}
		return false;
	}

	public static isSuperset(set: Set<{}>, subset: Set<{}>): boolean {
		for (const elem of subset) {
			if (!set.has(elem)) {
				return false;
			}
		}
		return true;
	}

	public static union(setA: Set<{}>, setB: Set<{}>): Set<{}> {
		const union = new Set(setA);
		for (const elem of setB) {
			union.add(elem);
		}
		return union;
	}

	public static intersection(setA: Set<{}>, setB: Set<{}>): Set<{}> {
		const intersection = new Set();
		for (const elem of setB) {
			if (setA.has(elem)) {
				intersection.add(elem);
			}
		}
		return intersection;
	}

	public static difference(setA: Set<{}>, setB: Set<{}>): Set<{}> {
		const difference = new Set(setA);
		for (const elem of setB) {
			difference.delete(elem);
		}
		return difference;
	}
}

export class MathUtil {
	public static approxEq(v1: number, v2: number, epsilon: number): boolean {
		if (epsilon == null) {
			epsilon = 0.001;
		}
		return Math.abs(v1 - v2) < epsilon;
	}

	public static getRandomInt(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}
}