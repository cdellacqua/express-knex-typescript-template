import { SerializableError } from '@cdellacqua/serializable-error';
import jwt from 'jsonwebtoken';
import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { HttpError } from '../../error';
import config from '../../../config';
import { find } from '../../../services/user';
import { HttpStatus } from '../../status';

// TODO: customize your authorization logic
const middleware = asyncWrapper(async (req, res, next) => {
	if (!req.headers.authorization) {
		throw new HttpError(HttpStatus.Unauthorized, 'unauthorized', undefined);
	}
	let decoded;
	try {
		decoded = jwt.verify(req.headers.authorization.substring('Bearer '.length), config.secret) as unknown as {sub: string, iat: number};
	} catch (err) {
		throw new HttpError(HttpStatus.Unauthorized, 'unauthorized', err);
	}
	if (!decoded) {
		throw new HttpError(HttpStatus.Unauthorized, 'unauthorized', new SerializableError('jwt decode returned a falsy value'));
	}
	const user = await find(decoded.sub);
	if (!user) {
		throw new HttpError(HttpStatus.Unauthorized, 'unauthorized', new SerializableError('jwt refers to a missing user'));
	}
	if (!user.enabled) {
		throw new HttpError(HttpStatus.Unauthorized, 'unauthorized', new SerializableError('jwt refers to a disabled user'));
	}
	if (user.minJwtIat.getTime() > decoded.iat * 1000) {
		throw new HttpError(HttpStatus.Unauthorized, 'unauthorized', new SerializableError('jwt iat is less than the min required for the specified user'));
	}
	res.locals.user = user;
	next();
});

export default middleware;
