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
