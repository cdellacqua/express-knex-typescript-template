import { SerializableError } from '@cdellacqua/serializable-error';

function sanitizePath(path: string): string {
	const sanitized = `/${path.replace(/\/$/, '').replace(/^\//, '')}`;
	return sanitized === '/' ? '' : sanitized;
}

const config = {
	http: {
		hostname: process.env.HTTP_HOST!,
		port: Number(process.env.HTTP_PORT),
		origin: process.env.HTTP_ORIGIN?.replace(/\/$/, ''),
		path: process.env.HTTP_PATH! && sanitizePath(process.env.HTTP_PATH!),
		baseUrl: `${process.env.HTTP_ORIGIN?.replace(/\/$/, '')}${process.env.HTTP_PATH! && sanitizePath(process.env.HTTP_PATH!)}`,
	},
	authentication: {
		tokenExpirationSeconds: Number(process.env.JWT_EXPIRATION_SECONDS),
	},
	environment: process.env.NODE_ENV! as 'development'|'staging'|'production'|'test',
	secret: process.env.SECRET!,
	log: {
		level: process.env.LOG_LEVEL!,
	},
	shutdown: {
		interval: Number(process.env.SHUTDOWN_INTERVAL_SECONDS),
	},
	product: {
		name: process.env.PRODUCT_NAME!,
		shortName: process.env.PRODUCT_SHORT_NAME!,
		locale: process.env.PRODUCT_LOCALE!,
	},
	signedUrlExpirationSeconds: Number(process.env.SIGNED_URL_EXPIRATION_SECONDS),
	smtp: {
		default: {
			port: Number(process.env.SMTP_PORT),
			host: process.env.SMTP_HOST!,
			ssl: process.env.SMTP_SSL!,
			username: process.env.SMTP_USER!,
			password: process.env.SMTP_PASS!,
			from: process.env.SMTP_FROM!,
		},
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
