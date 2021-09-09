import http from 'http';
import app from './express-app';
import { shutdownable } from './shutdown-server';

export default shutdownable(http.createServer(app));
