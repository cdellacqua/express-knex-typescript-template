import { SerializableError } from '@cdellacqua/serializable-error';
import pg from 'pg';
import BigNumber from 'bignumber.js';
import { config as knexTransactConfig } from '@cdellacqua/knex-transact';
import knex from '../db';
import config from '../config';
import logger from '../log/logger';
import server from '../http/server';


export async function start(): Promise<void> {
	// pg
	pg.types.setTypeParser(pg.types.builtins.NUMERIC, (decimal: string): BigNumber => new BigNumber(decimal));

	// knex-transact
	knexTransactConfig.knexInstance = knex;

	// http server
	await new Promise<void>((resolve, reject) => {
		function onFinish() {
			server.off('listening', onListening);
			server.off('error', onError);
		}

		function onListening() {
			resolve();
			onFinish();
		}
		function onError(err: Error) {
			reject(err);
			onFinish();
		}

		server.once('listening', onListening);
		server.once('error', onError);

		server.listen(config.http.port, config.http.hostname);
	});
	logger.info(`App started at http://${config.http.hostname}:${config.http.port}/`);
}

let stopping = false;
export async function stop(): Promise<void> {
	if (stopping) {
		throw new SerializableError('already stopping');
	}
	stopping = true;

	logger.info('Closing HTTP Server...');
	await server.closeWithSockets(config.shutdown.interval * 1000)
		.catch((err) => logger.error(err));

	logger.info('Closing DB connection...');
	await knex.destroy()
		.catch((err) => logger.error(err));

	logger.info('Graceful shutdown completed');
}
