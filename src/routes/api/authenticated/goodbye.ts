import { Router } from 'express';

const r: Router = Router();
export default r;

r.get('/', (_, res) => res.send(`goodbye ${res.locals.user.email}`));
