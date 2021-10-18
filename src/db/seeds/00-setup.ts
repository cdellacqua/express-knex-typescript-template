import { start } from '../../lifecycle';

export async function seed(): Promise<void> {
	await start();
}
