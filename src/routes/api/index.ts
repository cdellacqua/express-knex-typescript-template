import { Router } from 'express';
import helloRoutes from './hello';
import userRoutes from './user';
import authenticatedRoutes from './authenticated';

const r: Router = Router();
export default r;

r.use('/hello', helloRoutes);
r.use('/user', userRoutes);

// TODO: if you want to change the prefix for the authenticated routes, change the first argument in the following function call
r.use('/auth', authenticatedRoutes);
