import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import path from 'path';
import routes from './routes';
import logger from './log/logger';
import { HttpError } from './http/error';

const app = express();

// TODO: if your application is behind a proxy, you can specify its IP address.
// By default, it is assumed that the Node.js process runs behind a proxy on the same machine, so the loopback
// interface is specified
app.set('trust proxy', 'loopback');

app.set('views', path.join(__dirname, '..', '/views'));
app.set('view engine', 'pug');

app.use(morgan(':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms', {
	stream: {
		write: (msg) => logger.http(msg),
	},
}));

// TODO: if you want to enable or customize CORS support you can uncomment or edit the next line
// app.use(cors({ maxAge: 36000 }));

if (process.env.NODE_ENV === 'development') {
	Error.stackTraceLimit = Infinity;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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
		res.status(500).end();
	}
});

app.use((_: express.Request, res: express.Response) => {
	res.status(404).render('404');
});

export default app;
