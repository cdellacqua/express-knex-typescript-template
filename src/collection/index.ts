export function range(min: number, max?: number): number[] {
	if (max === undefined) {
		max = min;
		min = 0;
	}
	const values = new Array(max - min);
	for (let i = 0; i < values.length; i++) {
		values[i] = min + i;
	}
	return values;
}

export function chunk<T>(arr: T[], chunkLength: number): T[][] {
	const chunked = new Array<T[]>(Math.ceil(arr.length / chunkLength));
	for (let i = 0; i < chunked.length; i++) {
		chunked[i] = arr.slice(i * chunkLength, (i * chunkLength) + chunkLength);
	}

	return chunked;
}

export function chain<T>(arr: T[]): T[][] {
	if (arr.length === 0) {
		return [];
	}
	const pairs = new Array(arr.length - 1);
	for (let i = 0; i < pairs.length; i++) {
		pairs[i] = [arr[i], arr[i + 1]];
	}
	return pairs;
}

export function pluck<T, K extends string | number | symbol, TArr extends { [key in K]: T }>(arr: TArr[], prop: K): T[] {
	return arr.map((item) => item[prop]);
}

export function partition<T, TKey extends string | number>(arr: T[], partFn: ((v: T, i: number, arr: T[]) => TKey)): { [k in TKey]?: T[] } {
	return arr.reduce((part: { [k in TKey]?: T[] }, cur, i) => {
		const key = partFn(cur, i, arr);

		if (!part[key]) {
			part[key] = [];
		}
		(part as { [k in TKey]: T[] })[key].push(cur);

		return part;
	}, {} as { [k in TKey]?: T[] });
}
