import { EmailJobData } from '../email/index';
import { enqueue, QueueName } from './internals';

export { QueueName, startQueues as start, stop, workers } from './internals';

export async function enqueueEmail(data: EmailJobData): Promise<void> {
	await enqueue(QueueName.email, data);
}
