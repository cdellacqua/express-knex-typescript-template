import { asyncWrapper } from '@cdellacqua/express-async-wrapper';
import { RequestHandler } from 'express';
import { hash, hashCheck } from '.';
import config from '../config';

export async function signUrl(relativeUrl: string, expiresIn?: number): Promise<string> {
	let url = config.http.baseUrl + relativeUrl;
	if (expiresIn) {
		url += `${new URL(url).search ? '&' : '?'}hashts=${Math.floor(Date.now() / 1000) + expiresIn}`;
	}
	return `${url}${new URL(url).search ? '&' : '?'}hash=${encodeURIComponent(await hash(url.substring(config.http.baseUrl.length) + config.secret))}`;
}

export async function verifyUrl(relativeUrl: string): Promise<boolean> {
	const data = new URL(config.http.baseUrl + relativeUrl);
	const clientHash = data.searchParams.get('hash');
	const expiresAt = data.searchParams.get('hashts');
	if (!clientHash) {
		return false;
	}
	if (!(await hashCheck(decodeURIComponent(relativeUrl.replace(/(&|\?)hash=[^&]+/, '')) + config.secret, clientHash))) {
		return false;
	}
	if (expiresAt && Math.floor(Date.now() / 1000) > Number(expiresAt)) {
		return false;
	}
	return true;
}

export function verifyUrlMiddleware(): RequestHandler {
	return asyncWrapper(async (req, res, next) => {
		if (!await verifyUrl(req.originalUrl)) {
			res.status(403).render('403');
			return;
		}
		next();
	});
}
