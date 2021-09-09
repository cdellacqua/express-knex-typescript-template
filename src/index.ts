import { nullary } from './algebra/functions';
import { start, stop } from './lifecycle';
import logger from './log/logger';

start({ queues: true, server: true })
	.catch(async (err) => {
		logger.error(err);
		logger.error('Startup failure, stopping...');
		await stop().catch((stopErr) => logger.error(stopErr));
		process.exit(1);
	});

async function verboseStop() {
	logger.warn('Received shutdown signal, closing server...');
	try {
		await stop();
		process.exit(0);
	} catch (err) {
		logger.error(err);
		process.exit(2);
	}
}

process.once('SIGTERM', nullary(verboseStop));
process.once('SIGINT', nullary(verboseStop));
