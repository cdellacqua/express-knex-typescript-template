import 'reflect-metadata';

import './startup';

import { Socket } from 'net';
import app from './app';
import config from './config';
import { logger } from './log/logger';
import { noop, sleep, waitImmediate } from './helpers/lambdas';
import knex from './db';

const server = app.listen(config.http.port, config.http.hostname, () => {
	logger.info(`App started at http://${config.http.hostname}:${config.http.port}/`);
});

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
			logger.warn(`Server stopped but ${activeSockets.length} sockets are still active, waiting ${remainingSeconds}s before forcing shutdown...`);
			await sleep(remainingSeconds);
		}

		if (activeSockets.length === 0) {
			logger.warn('No active sockets to forcibly shutdown');
		} else {
			logger.warn(`${activeSockets.length} sockets still active, forcing shutdown...`);
			activeSockets.forEach((socket) => {
				socket.end(noop);
			});
			await waitImmediate();
			activeSockets.forEach((socket) => {
				socket.destroy();
			});
			logger.warn(`${activeSockets.length} sockets destroyed`);
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
		logger.warn('Graceful shutdown completed, bye');
	});
}

process.once('SIGTERM', close);
process.once('SIGINT', close);

export default server;
