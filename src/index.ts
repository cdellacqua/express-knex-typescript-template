import 'reflect-metadata';

import './startup';

import app from './app';
import config from './config';
import { logger } from './log/logger';

const server = app.listen(config.http.port, config.http.hostname, () => {
	logger.info(`App started at http://${config.http.hostname}:${config.http.port}/`);
});

export default server;
