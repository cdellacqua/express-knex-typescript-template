import { SerializableError } from '@cdellacqua/serializable-error';

const config = {
	http: {
		hostname: process.env.HOST!,
		port: Number(process.env.PORT),
	},
	authentication: {
		tokenExpirationSeconds: Number(process.env.JWT_EXPIRATION_SECONDS),
	},
	environment: process.env.NODE_ENV!,
	secret: process.env.SECRET!,
	log: {
		level: process.env.LOG_LEVEL!,
	},
	shutdown: {
		interval: Number(process.env.SHUTDOWN_INTERVAL_SECONDS || 10),
	},
};

function recursiveCheck(obj: Record<string, any>, path: string[] = []) {
	Object.keys(obj).forEach((key) => {
		if (obj[key] === undefined || Number.isNaN(obj[key])) {
			throw new SerializableError(`missing env variable for config key "${[...path, key].join('.')}"`);
		} else if (typeof obj[key] === 'object') {
			recursiveCheck(obj[key], [...path, key]);
		}
	});
}

recursiveCheck(config);

export default config;