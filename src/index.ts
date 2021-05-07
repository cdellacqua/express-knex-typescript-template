import { nullary } from './algebra/functions';
import { start, stop } from './lifecycle';
import logger from './log/logger';

start({ queues: true, server: true });

async function verboseStop() {
	logger.warn('Received shutdown signal, closing server...');
	try {
		await stop();
		process.exit(0);
	} catch (err) {
		logger.error(err);
	}
}

process.once('SIGTERM', nullary(verboseStop));
process.once('SIGINT', nullary(verboseStop));
