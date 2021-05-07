import {
	Queue, Worker, QueueScheduler,
} from 'bullmq';
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

export async function startQueues(): Promise<void> {
	Object.values(QueueName).forEach((queueName) => {
		queues[queueName] = new Queue(queueName, {
			defaultJobOptions: {
				attempts: config.queue.attempts,
				backoff: {
					type: config.queue.backoff.type,
					delay: config.queue.backoff.delay,
				},
			},
		})
			.on('error', (err) => logger.error(err));

		schedulers[queueName] = new QueueScheduler(queueName)
			.on('error', (err) => logger.error(err));

		workers[queueName] = new Worker(
			queueName,
			emailWorker,
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

	await Promise.all(Object.values(QueueName).flatMap((queue) => [
		queues[queue].waitUntilReady(),
		schedulers[queue].waitUntilReady(),
		workers[queue].waitUntilReady(),
	]));
}

export async function stop(): Promise<void> {
	// Cannot wait due to a bug that occurs when redis goes offline (even temporarily - tested locally)
	// https://github.com/OptimalBits/bull/issues/1414
	// Temporary fix
	return new Promise((resolve) => {
		const timeout = setTimeout(() => resolve(), 5000);
		Promise.all([
			...Object.values(queues || {}).map((q) => q.close()),
			...Object.values(workers || {}).map((w) => w.close()),
			...Object.values(schedulers || {}).map((s) => s.close()),
		]).then(() => {
			clearTimeout(timeout);
			resolve();
		});
	});
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function enqueue(queue: QueueName, data?: any): Promise<void> {
	await queues[queue].add(queue, data);
}
