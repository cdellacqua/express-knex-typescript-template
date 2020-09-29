import { Router } from 'express';

const r: Router = Router();
export default r;

r.get('/', (_, res) => res.render('hello-world'));
