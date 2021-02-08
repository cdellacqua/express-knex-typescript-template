import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { HttpError } from '../http/error';
import { HttpStatus } from '../http/status';

export function rejectOnFailedValidation(): RequestHandler {
	return (req, _, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			next(new HttpError(HttpStatus.UnprocessableEntity, errors.array()));
		} else {
			next();
		}
	};
}
