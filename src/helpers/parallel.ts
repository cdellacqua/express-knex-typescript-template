import { chunk } from './collection';

export async function awaitParallel(fns: (() => Promise<any>)[], concurrency?: number): Promise<void> {
	if (!concurrency) {
		await Promise.all(fns);
	} else {
		const chunks = chunk(fns, concurrency);
		await chunks
			.reduce(
				(chain, fnsChunk) => chain.then(async () => { await Promise.all(fnsChunk); }),
				Promise.resolve(),
			);
	}
}
