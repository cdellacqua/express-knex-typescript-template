import { Job } from 'bullmq';
import { EmailJobData, send } from '../../email/index';

export default async (job: Job<EmailJobData>): Promise<void> => {
	await send(
		job.data.rendererParams,
		job.data.to,
		job.data.subject,
		job.data.from,
	);
};
