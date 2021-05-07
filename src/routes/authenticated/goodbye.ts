import { Router } from 'express';

const r: Router = Router();
export default r;

// TODO: remove this example
r.get('/', (_, res) => res.send(`goodbye ${res.locals.user.email}`));
