import winston, { format } from 'winston';
import config from '../config';

export const logger = winston.createLogger({
	level: config.log.level,
	format: format.combine(
		format.timestamp(),
		format.errors({ stack: true }),
		format.splat(),
		format.json(),
	),
	transports: [
		new winston.transports.Console(),
	],
});
