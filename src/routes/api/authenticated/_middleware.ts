import { SerializableError } from '@cdellacqua/serializable-error';
import jwt from 'jsonwebtoken';
import { container } from 'tsyringe';
import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { HttpError } from '../../../http/error';
import config from '../../../config';
import { UserService } from '../../../services/user';

// TODO: customize your authorization logic
const middleware = asyncWrapper(async (req, res, next) => {
	if (!req.headers.authorization) {
		throw new HttpError(401, 'unauthorized', undefined, false);
	}
	let decoded;
	try {
		decoded = jwt.verify(req.headers.authorization.substring('Bearer '.length), config.secret) as unknown as {sub: string, iat: number};
	} catch (err) {
		throw new HttpError(401, 'unauthorized', err);
	}
	if (!decoded) {
		throw new HttpError(401, 'unauthorized', new SerializableError('jwt decode returned falsy value'), false);
	}
	const userService = container.resolve(UserService);
	const user = await userService.find(decoded.sub);
	if (!user) {
		throw new HttpError(401, 'unauthorized', new SerializableError('jwt refers to missing user'), false);
	}
	if (!user.enabled) {
		throw new HttpError(401, 'unauthorized', new SerializableError('jwt refers to disabled user'), false);
	}
	if (user.minJwtIat.getTime() > decoded.iat * 1000) {
		throw new HttpError(401, 'unauthorized', new SerializableError('jwt iat is less than the min required for the specified user'), false);
	}
	res.locals.user = user;
	next();
});

export default middleware;
