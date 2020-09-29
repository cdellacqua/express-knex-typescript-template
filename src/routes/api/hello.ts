import { Router } from 'express';

const r: Router = Router();
export default r;

r.get('/', (_, res) => res.send('world'));
