import { Router } from 'express';
import helloRoutes from './hello';

const r: Router = Router();
export default r;

r.use('/', helloRoutes);
