export function sleep(ms: number): Promise<void> {
	return new Promise((res) => setTimeout(res, ms));
}

export function waitImmediate(): Promise<void> {
	return new Promise((res) => setImmediate(res));
}
