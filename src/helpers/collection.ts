/* eslint-disable no-param-reassign */
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
		chunked[i] = arr.slice(i * chunkLength, i * chunkLength + chunkLength);
	}

	return chunked;
}
