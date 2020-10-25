import { Router } from 'express';

const r: Router = Router();
export default r;

// TODO: remove this example
r.get('/', (_, res) => res.render('hello-world'));
