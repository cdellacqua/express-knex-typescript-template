import { nullary } from './algebra/functions';
import { start, stop } from './lifecycle';
import logger from './log/logger';

start()
	.catch(async (err) => {
		logger.error(err);
		logger.error('Startup failure, stopping...');
		await stop().catch((stopErr) => logger.error(stopErr));
		process.exit(1);
	});

let stopping = false;
async function verboseStop() {
	if (stopping) {
		logger.warn('Received shutdown signal but application is already stopping');
		return;
	}
	logger.warn('Received shutdown signal, stopping...');
	stopping = true;
	try {
		await stop();
		process.exit(0);
	} catch (err) {
		logger.error(err);
		process.exit(2);
	}
}

process.on('SIGTERM', nullary(verboseStop));
process.on('SIGINT', nullary(verboseStop));
