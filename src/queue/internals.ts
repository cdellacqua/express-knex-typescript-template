import {
	Queue, Worker, QueueScheduler,
} from 'bullmq';
import IORedis from 'ioredis';
import config from '../config';
import logger from '../log/logger';
import { noop } from '../runtime';
import emailWorker from './workers/email';

export enum QueueName {
	email = 'email',
}

const maxQueueNameLength = Math.max(...Object.values(QueueName).map((x) => x.length));

function emptyQueueRecord(): Record<QueueName, any> {
	return {
		email: [],
	};
}

export const queues: Record<QueueName, Queue> = emptyQueueRecord();
const schedulers: Record<QueueName, QueueScheduler> = emptyQueueRecord();
export const workers: Record<QueueName, Worker> = emptyQueueRecord();

export async function start(): Promise<void> {
	const connection = {
		host: config.redis.host,
		port: config.redis.port,
	};

	const testConnection = new IORedis(connection.port, connection.host, {
		lazyConnect: true,
	});
	await testConnection.connect();
	testConnection.quit().catch(noop);

	await Promise.all(Object.values(QueueName).map(async (queueName) => {
		queues[queueName] = new Queue(queueName, {
			defaultJobOptions: {
				attempts: config.queue.attempts,
				backoff: {
					type: config.queue.backoff.type,
					delay: config.queue.backoff.delay,
				},
			},
			connection,
		})
			.on('error', (err) => logger.error(err));

		schedulers[queueName] = new QueueScheduler(queueName, { connection })
			.on('error', (err) => logger.error(err));

		// Known issue: https://github.com/taskforcesh/bullmq/issues/452
		// After reconnecting to redis the worker doesn't resume processing the queue
		workers[queueName] = new Worker(
			queueName,
			emailWorker,
			{ connection },
		)
			.on('active', ({ id }) => logger.info(
				`[ QUEUE: ${queueName.padEnd(maxQueueNameLength, ' ')} ] Job "${id}" started`,
			))
			.on('progress', ({ id, progress }) => logger.info(
				`[ QUEUE: ${queueName.padEnd(maxQueueNameLength, ' ')} ] Job "${id}" progress: ${Math.floor(progress * 100)}%`,
			))
			.on('completed', ({ id }) => logger.info(
				`[ QUEUE: ${queueName.padEnd(maxQueueNameLength, ' ')} ] Job "${id}" completed`,
			))
			.on('stalled', ({ id }) => logger.warn(
				`[ QUEUE: ${queueName.padEnd(maxQueueNameLength, ' ')} ] Job "${id}" stalled`,
			))
			.on('failed', ({ id }, err) => logger.error(
				`[ QUEUE: ${queueName.padEnd(maxQueueNameLength, ' ')} ] Job "${id}" failed: ${err}`,
			))
			.on('error', (err) => logger.error(err));

		await Promise.all([
			queues[queueName].waitUntilReady(),
			schedulers[queueName].waitUntilReady(),
			workers[queueName].waitUntilReady(),
		]);
	}));
}

export async function stop(): Promise<void> {
	await Promise.all(
		Object.values(QueueName).flatMap((queueName) => [
			queues[queueName] && queues[queueName].client.then((client) => client.disconnect(false)),
			schedulers[queueName] && schedulers[queueName].client.then((client) => client.disconnect(false)),
			workers[queueName] && workers[queueName].client.then((client) => client.disconnect(false)),
		]),
	);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function enqueue(queue: QueueName, data?: any): Promise<void> {
	await queues[queue].add(queue, data);
}
