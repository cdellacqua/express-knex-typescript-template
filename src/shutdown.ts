import { Socket } from 'net';
import { Server } from 'http';
import config from './config';
import logger from './log/logger';
import { noop } from './helpers/lambdas';
import { sleep, waitImmediate } from './helpers/time';
import knex from './db';

export function shutdownable(server: Server): Server {
	const activeSockets: Socket[] = [];
	server.on('connection', (socket) => {
		activeSockets.push(socket);
		socket.on('close', () => activeSockets.splice(activeSockets.indexOf(socket), 1));
	});

	async function closeActiveSockets(shutdownTimestamp: number) {
		if (activeSockets.length > 0) {
			const activeTimestamp = Math.round(Date.now() / 1000);
			const remainingSeconds = config.shutdown.interval - (activeTimestamp - shutdownTimestamp);
			if (remainingSeconds > 0) {
				logger.warn(
					`Server stopped but ${
						activeSockets.length
					} socket${
						activeSockets.length === 1 ? ' is' : 's are'
					} still active, waiting ${remainingSeconds}s before forcing shutdown...`,
				);
				await sleep(remainingSeconds * 1000);
			}

			if (activeSockets.length === 0) {
				logger.info('No active sockets to forcibly shutdown');
			} else {
				logger.warn(`${activeSockets.length} socket${activeSockets.length === 1 ? '' : 's'} still active, forcing shutdown...`);
				activeSockets.forEach((socket) => {
					socket.end(noop);
				});
				await waitImmediate();
				activeSockets.forEach((socket) => {
					socket.destroy();
				});
				logger.warn(`${activeSockets.length} socket${activeSockets.length === 1 ? '' : 's'} destroyed`);
			}
		}
	}

	let closing = false;
	function close() {
		if (closing) {
			return;
		}
		closing = true;

		logger.warn('Received shutdown signal, closing server...');
		const shutdownTimestamp = Math.round(Date.now() / 1000);
		server.close(async () => { // Stop accepting new connections
			await closeActiveSockets(shutdownTimestamp);
			await knex.destroy();
			logger.info('Graceful shutdown completed, bye');
			process.exit(0);
		});
	}

	server.once('listening', () => {
		process.once('SIGTERM', close);
		process.once('SIGINT', close);
	});

	return server;
}
