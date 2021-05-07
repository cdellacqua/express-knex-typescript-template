import { start, stop } from '../src/lifecycle';
import { nullary } from '../src/algebra/functions';

type DoneFunction = () => {};

export const mochaHooks = {
	beforeAll(done: DoneFunction): void {
		start({ queues: true, server: true })
			.then(nullary(done));
	},
	afterAll(done: DoneFunction): void {
		stop()
			.then(nullary(done));
	},
};
