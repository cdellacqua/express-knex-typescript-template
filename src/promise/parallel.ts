import { chunk } from '../collection';

export async function parallelize(fns: (() => Promise<any>)[], concurrency?: number): Promise<void> {
	if (!concurrency) {
		await Promise.all(fns.map((fn) => fn()));
	} else {
		const chunks = chunk(fns, concurrency);
		await chunks
			.reduce(
				(chain, fnsChunk) => chain.then(async () => { await Promise.all(fnsChunk.map((fn) => fn())); }),
				Promise.resolve(),
			);
	}
}
