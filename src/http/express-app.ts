import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { join } from 'path';
import routes from './routes';
import logger from '../log/logger';
import { HttpError } from './error';
import { HttpStatus } from './status';
import config from '../config';
import { getTranslator } from '../i18n';

const app = express();

// Pug default locals
app.locals.config = config;

// TODO: if your application is behind a proxy, you can specify its IP address.
// By default, it is assumed that the Node.js process runs behind a proxy on the same machine, so the loopback
// interface is specified
app.set('trust proxy', 'loopback');

app.set('views', join(__dirname, '..', '..', 'views', 'pages'));
app.set('view engine', 'pug');

app.use(morgan(':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms', {
	stream: {
		write: (msg) => logger.http(msg),
	},
}));

// TODO: You can edit the next line to enable CORS in production or customize the following behavior
if (config.environment === 'development') {
	app.use(cors({ maxAge: 36000 }));
}

if (config.environment === 'development') {
	Error.stackTraceLimit = Infinity;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
	// eslint-disable-next-line no-underscore-dangle
	res.locals.__ = getTranslator(req.acceptsLanguages() || []);
	next();
});
app.use('/', routes);

app.use((err: Error, req: express.Request, res: express.Response, _: express.NextFunction) => {
	if (err instanceof HttpError) {
		res.status(err.statusCode);
		if (err.statusCode >= 400 && err.statusCode < 500) {
			logger.warn(err);
			if (err.content) {
				res.json(err.content);
			} else {
				res.send(err.message);
			}
		} else {
			logger.error(err);
			res.end();
		}
	} else {
		logger.error(err);
		res.status(HttpStatus.InternalServerError).end();
	}
});

app.use((_: express.Request, res: express.Response) => {
	res.status(HttpStatus.NotFound).render('404');
});

export default app;
