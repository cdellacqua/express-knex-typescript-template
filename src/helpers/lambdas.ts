export function identity<T>(value: T): T {
	return value;
}

export function identityPromise<T>(value: T): Promise<T> {
	return Promise.resolve(value);
}

export function range(from: number, to: number): number[] {
	const array: number[] = [];
	for (let i = 0; i <= to; i++) {
		array.push(i);
	}
	return array;
}

export const noop = (): void => undefined;
