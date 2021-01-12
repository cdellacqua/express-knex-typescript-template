import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { HttpError } from '../http/error';

export function rejectOnFailedValidation(): RequestHandler {
	return (req, _, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			next(new HttpError(422, errors.array()));
		} else {
			next();
		}
	};
}
