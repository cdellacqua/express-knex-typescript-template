import { SerializableError } from '@cdellacqua/serializable-error';

export class HttpError extends SerializableError {
	constructor(public readonly statusCode: number, message?: string, cause?: Error, public readonly log: boolean = true) {
		super(message, cause);
		if (statusCode < 400 || statusCode >= 600) {
			throw new SerializableError('provided code is not an error code');
		}
	}
}
