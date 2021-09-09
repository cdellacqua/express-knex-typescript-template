import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { Router } from 'express';
import { body } from 'express-validator';
import { HttpStatus } from '../../status';
import { del, generateAuthResponse, update } from '../../../services/user';

const r: Router = Router();
export default r;

// Renew JWT
r.post('/jwt', asyncWrapper(async (req, res) => {
	const authResponse = generateAuthResponse(res.locals.user);
	res.status(HttpStatus.Created).json(authResponse);
}));

r.delete('/', asyncWrapper(async (req, res) => {
	await del(res.locals.user.id);
	res.status(HttpStatus.NoContent).end();
}));

r.put('/minJwtIat', [
	body('date').isISO8601(),
], asyncWrapper(async (req, res) => {
	const { minJwtIat } = await update(res.locals.user.id, {
		minJwtIat: new Date(req.body.date),
	});
	res.json({
		minJwtIat,
	});
}));
