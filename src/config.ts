export default {
	http: {
		hostname: process.env.HOST || 'localhost',
		port: Number(process.env.PORT || 3000),
	},
	authentication: {
		tokenExpirationSeconds: Number(process.env.JWT_EXPIRATION_SECONDS || 8640000),
	},
	environment: process.env.NODE_ENV || 'development',
	secret: process.env.SECRET || 'secret',
	log: {
		level: process.env.LOG_LEVEL || 'http',
	},
	shutdown: {
		interval: Number(process.env.SHUTDOWN_INTERVAL_SECONDS || 10),
	},
};
