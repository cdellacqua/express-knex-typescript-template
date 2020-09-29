import { Router } from 'express';

const r: Router = Router();
export default r;

r.get('/hello', (_, res) => res.render('world'));
