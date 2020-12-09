import { SerializableError } from '@cdellacqua/serializable-error';

export class HttpError extends SerializableError {
	content?: object;

	constructor(public readonly statusCode: number, messageOrContent?: string|object, cause?: Error) {
		super(
			typeof messageOrContent === 'object' && messageOrContent
				? JSON.stringify(messageOrContent)
				: messageOrContent,
			cause,
		);
		if (typeof messageOrContent === 'object' && messageOrContent) {
			this.content = messageOrContent;
		}
		if (statusCode < 400 || statusCode >= 600) {
			throw new SerializableError('provided code is not an error code');
		}
	}
}
