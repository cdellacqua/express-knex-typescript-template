import { chunk } from './collection';

export async function startParallel(fns: (() => Promise<any>)[]): Promise<void> {
	const chunks = chunk(fns, 10);
	await chunks
		.reduce(
			(chain, fnsChunk) => chain.then(async () => { await Promise.all(fnsChunk); }),
			Promise.resolve(),
		);
}
