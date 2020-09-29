import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { container } from 'tsyringe';
import { Router } from 'express';
import { UserService } from '../../../services/user';

const r: Router = Router();
export default r;

// Renew JWT
r.post('/jwt', asyncWrapper(async (req, res) => {
	const userService = container.resolve(UserService);
	const authResponse = userService.generateAuthResponse(res.locals.user);
	res.status(201).json(authResponse);
}));

r.delete('/', asyncWrapper(async (req, res) => {
	const userService = container.resolve(UserService);
	await userService.delete(res.locals.user.id);
	res.status(204).end();
}));
