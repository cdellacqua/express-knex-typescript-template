import './startup';

import config from './config';
import logger from './log/logger';
import server from './server';

server.listen(config.http.port, config.http.hostname, () => {
	logger.info(`App started at http://${config.http.hostname}:${config.http.port}/`);
});
