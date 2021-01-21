export function identity<T>(value: T): T {
	return value;
}

export function identityPromise<T>(value: T): Promise<T> {
	return Promise.resolve(value);
}

export const noop = (): void => undefined;
