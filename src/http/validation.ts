import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { HttpError } from './error';
import { HttpStatus, HttpStatusMessage } from './status';

export function validationMiddleware(status = HttpStatus.UnprocessableEntity, sendErrors = true): RequestHandler {
	return (req, _, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			next(new HttpError(status, sendErrors ? errors.array() : HttpStatusMessage[status]));
		} else {
			next();
		}
	};
}
