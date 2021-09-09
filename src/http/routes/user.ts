import { Router } from 'express';
import { body } from 'express-validator';
import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { login } from '../../services/user';
import { validationMiddleware } from '../validation';
import { HttpStatus } from '../status';

const r: Router = Router();
export default r;

r.post('/jwt', [
	body('email').isEmail(),
	body('password').isString().isLength({ min: 1 }),
	validationMiddleware(),
], asyncWrapper(async (req, res) => {
	const loginResult = await login({
		email: req.body.email,
		password: req.body.password,
	});
	if (!loginResult) {
		res.status(HttpStatus.Unauthorized).end();
	} else {
		res.status(HttpStatus.Created).json(loginResult);
	}
}));
