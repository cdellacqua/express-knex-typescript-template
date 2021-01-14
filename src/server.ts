import http from 'http';
import app from './app';
import { shutdownable } from './shutdown';

export default shutdownable(http.createServer(app));
