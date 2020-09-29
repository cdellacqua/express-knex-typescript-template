import { Router } from 'express';
import { body } from 'express-validator';
import { container } from 'tsyringe';
import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { UserService } from '../../services/user';
import { rejectOnFailedValidation } from '../../helpers/validator';

const r: Router = Router();
export default r;

r.post('/jwt', [
	body('email').isEmail(),
	body('password').isString().isLength({ min: 1 }),
	rejectOnFailedValidation(),
], asyncWrapper(async (req, res) => {
	const userService = container.resolve(UserService);
	const login = await userService.login({
		email: req.body.email,
		password: req.body.password,
	});
	if (!login) {
		res.status(401).end();
	} else {
		res.status(201).json(login);
	}
}));
