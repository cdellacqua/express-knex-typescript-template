import { Router } from 'express';
import goodbyeRoutes from './goodbye';
import userRoutes from './user';
import authMiddleware from './_middleware';

const r: Router = Router();
export default r;

r.use(authMiddleware);

// TODO: remove this example
r.use('/goodbye', goodbyeRoutes);


r.use('/user', userRoutes);
