import '../src/startup';
import knex from '../src/db';
import server from '../src/server';
import logger from '../src/log/logger';
import config from '../src/config';

type DoneFunction = () => {};

export const mochaHooks = {
	beforeAll(done: DoneFunction): void {
		server.listen(config.http.port, config.http.hostname, () => {
			logger.info(`Test server started at http://${config.http.hostname}:${config.http.port}/`);
			done();
		});
	},
	afterAll(done: DoneFunction): void {
		server.close(() => knex.destroy(() => done()));
	},
};
