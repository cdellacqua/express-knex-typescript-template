import { stop } from '../../lifecycle';

export async function seed(): Promise<void> {
	await stop();
}
