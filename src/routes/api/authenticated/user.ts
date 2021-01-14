import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { body } from 'express-validator';
import { destroy, generateAuthResponse, update } from '../../../services/user';

const r: Router = Router();
export default r;

// Renew JWT
r.post('/jwt', asyncWrapper(async (req, res) => {
	const authResponse = generateAuthResponse(res.locals.user);
	res.status(201).json(authResponse);
}));

r.delete('/', asyncWrapper(async (req, res) => {
	await destroy(res.locals.user.id);
	res.status(204).end();
}));

r.put('/minJwtIat', [
	body('date').isISO8601(),
], asyncWrapper(async (req, res) => {
	const { minJwtIat } = await update(res.locals.user.id, {
		minJwtIat: new Date(req.body.date),
	});
	res.status(200).json({
		minJwtIat,
	});
}));
