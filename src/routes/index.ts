import { Router, static as expressStatic } from 'express';
import path from 'path';
import apiRoutes from './api';
import ssrRoutes from './ssr';

const r: Router = Router();
export default r;

r.use('/api', apiRoutes);
r.use('/', ssrRoutes);

// TODO: for development purposes express will serve static files from the www directory, in a production environment
// this task should be performed by a reverse proxy to improve performance
if (process.env.NODE_ENV === 'development') {
	r.use('/', expressStatic(path.join(__dirname, '..', '..', 'www')));
}
