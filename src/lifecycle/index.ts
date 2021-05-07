import { SerializableError } from '@cdellacqua/serializable-error';
import pg from 'pg';
import BigNumber from 'bignumber.js';
import { config as knexTransactConfig } from '@cdellacqua/knex-transact';
import knex from '../db';
import { start as startQueues, stop as stopQueues } from '../queue';
import config from '../config';
import logger from '../log/logger';
import server from '../server';

export interface SystemServices {
	queues?: boolean,
	server?: boolean,
}

let systemServices: SystemServices | undefined;

export async function start(startConfig?: SystemServices): Promise<void> {
	if (systemServices) {
		throw new SerializableError('already started');
	}

	systemServices = startConfig || {};

	// pg
	pg.types.setTypeParser(pg.types.builtins.NUMERIC, (decimal: string): BigNumber => new BigNumber(decimal));

	// knex-transact
	knexTransactConfig.knexInstance = knex;

	// job queues
	if (systemServices?.queues) {
		await startQueues();
	}

	// http server
	if (systemServices?.server) {
		server.listen(config.http.port, config.http.hostname, () => {
			logger.info(`App started at http://${config.http.hostname}:${config.http.port}/`);
		});
	}
}

let stopping = false;
export async function stop(): Promise<void> {
	if (stopping) {
		throw new SerializableError('already stopping');
	}
	stopping = true;

	if (systemServices?.server) {
		logger.info('Closing HTTP Server...');
		await server.closeWithSockets(config.shutdown.interval * 1000)
			.catch((err) => logger.error(err));
	}

	logger.info('Closing DB connection...');
	await knex.destroy()
		.catch((err) => logger.error(err));

	if (systemServices?.queues) {
		logger.info('Closing background queues...');
		await stopQueues()
			.catch((err) => logger.error(err));
	}

	logger.info('Graceful shutdown completed');
}
