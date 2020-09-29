import { SerializableError } from '@cdellacqua/serializable-error';
import {
	NextFunction, Request, Response,
} from 'express';
import jwt from 'jsonwebtoken';
import { container } from 'tsyringe';
import { HttpError } from '../../../http/error';
import config from '../../../config';
import { UserService } from '../../../services/user';

// TODO: customize your authorization logic
export default (req: Request, res: Response, next: NextFunction): void => {
	if (!req.headers.authorization) {
		next(new HttpError(401, 'unauthorized', undefined, false));
		return;
	}
	try {
		const decoded = jwt.verify(req.headers.authorization.substring('Bearer '.length), config.secret) as unknown as {sub: string, iat: number};
		if (!decoded) {
			next(new HttpError(401, 'unauthorized', new SerializableError('jwt decode returned falsy value'), false));
			return;
		}
		const userService = container.resolve(UserService);
		userService.find(decoded.sub)
			.then((user) => {
				if (!user) {
					next(new HttpError(401, 'unauthorized', new SerializableError('jwt refers to missing user'), false));
					return;
				}
				if (!user.enabled) {
					next(new HttpError(401, 'unauthorized', new SerializableError('jwt refers to disabled user', false)));
					return;
				}
				if (user.minJwtIat.getTime() > decoded.iat * 1000) {
					next(new HttpError(401, 'unauthorized', new SerializableError('jwt iat is less than the min required for the specified user'), false));
					return;
				}
				res.locals.user = user;
				next();
			}, (err) => next(err));
	} catch (err) {
		next(new HttpError(401, 'unauthorized', err));
	}
};
