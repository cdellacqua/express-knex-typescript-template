import {
	Request, Response, NextFunction, RequestHandler,
} from 'express';
import { validationResult } from 'express-validator';

export function rejectOnFailedValidation(): RequestHandler {
	return (req: Request, res: Response, next: NextFunction): void => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(422).json({ errors: errors.array() });
		} else {
			next();
		}
	};
}
