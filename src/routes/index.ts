import { Router, static as expressStatic } from 'express';
import path from 'path';
import apiRoutes from './api';
import ssrRoutes from './ssr';

const r: Router = Router();
export default r;

r.use('/api', apiRoutes);
r.use('/', ssrRoutes);

if (process.env.NODE_ENV === 'development') {
	r.use('/', expressStatic(path.join(__dirname, '..', '..', 'www')));
}
