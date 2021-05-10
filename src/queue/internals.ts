import {
	Queue, Worker, QueueScheduler,
} from 'bullmq';
import IORedis from 'ioredis';
import config from '../config';
import logger from '../log/logger';
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

const connection = new IORedis(config.redis.port, config.redis.host, {
	lazyConnect: true,
}).on('error', (err) => logger.error(err));

export async function start(): Promise<void> {
	await connection.connect();

	Object.values(QueueName).forEach((queueName) => {
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

		schedulers[queueName] = new QueueScheduler(queueName, { 
			connection,
		})
			.on('error', (err) => logger.error(err));

		workers[queueName] = new Worker(
			queueName,
			emailWorker,
			{
				connection,
			},
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
	});
}

export async function stop(): Promise<void> {
	await connection?.quit();
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function enqueue(queue: QueueName, data?: any): Promise<void> {
	await queues[queue].add(queue, data);
}
