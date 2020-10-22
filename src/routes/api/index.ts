import { Router } from 'express';
import userRoutes from './user';
import authenticatedRoutes from './authenticated';

const r: Router = Router();
export default r;

// TODO: remove this example
r.get('/', (_, res) => res.send('hello, World!'));

r.use('/user', userRoutes);

// TODO: if you want to change the prefix for the authenticated routes, change the first argument in the following function call
r.use('/auth', authenticatedRoutes);
