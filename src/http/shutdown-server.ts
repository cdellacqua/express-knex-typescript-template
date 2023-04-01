import { Socket } from 'net';
import { Server } from 'http';
import logger from '../log/logger';
import { sleep, waitImmediate } from '../runtime/delay';
import { noop } from '../runtime';

export function shutdownable(server: Server): Server & { closeWithSockets: (timeoutMs: number) => Promise<void> } {
	const activeSockets: Socket[] = [];
	server.on('connection', (socket) => {
		activeSockets.push(socket);
		socket.on('close', () => activeSockets.splice(activeSockets.indexOf(socket), 1));
	});

	async function closeActiveSockets(timeoutMs: number) {
		if (activeSockets.length > 0) {
			const remainingSeconds = Math.floor(timeoutMs / 1000);
			if (remainingSeconds > 0) {
				logger.warn(
					`Server stopped but ${activeSockets.length
					} socket${activeSockets.length === 1 ? ' is' : 's are'
					} still active, waiting ${remainingSeconds}s before forcing shutdown...`,
				);
				await sleep(timeoutMs);
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

	// eslint-disable-next-line no-param-reassign
	(server as any).closeWithSockets = async (timeoutMs: number) => {
		server.close(); // Stop receiving new connections
		await Promise.resolve(); // Wait a "tick" to let pending callbacks run
		await closeActiveSockets(timeoutMs); // Close remaining sockets, enforcing the passed timeout
	};

	return server as Server & { closeWithSockets: (timeoutMs: number) => Promise<void> };
}
