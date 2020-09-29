import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import path from 'path';
import routes from './routes';
import { logger } from './log/logger';
import { HttpError } from './http/error';

const app = express();

app.set('views', path.join(__dirname, '..', '/views'));
app.set('view engine', 'pug');

app.use(morgan(':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms', {
	stream: {
		write: (msg) => logger.http(msg),
	},
}));

// TODO: if you want to disable or customize CORS support you can comment or edit the next line
app.use(cors());

if (process.env.NODE_ENV === 'development') {
	Error.stackTraceLimit = Infinity;
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', routes);

app.use((err: Error, req: express.Request, res: express.Response, _: express.NextFunction) => {
	const statusCode = err instanceof HttpError ? err.statusCode : 500;
	if (!(err instanceof HttpError && !err.log)) {
		logger.error(err);
	}
	res.status(statusCode);
	if (process.env.NODE_ENV === 'development') {
		res.json(err);
	} else if (statusCode >= 400 && statusCode < 500) {
		res.send(err.message);
	}
	res.end();
});

export default app;
