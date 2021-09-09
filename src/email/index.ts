import { SerializableError } from '@cdellacqua/serializable-error';
import path from 'path';
import pug from 'pug';
import { existsSync } from 'fs';
import nodemailer from 'nodemailer';
import BigNumber from 'bignumber.js';
import config from '../config';
import { getDecimalSeparator, getTranslator } from '../i18n';

export enum EmailFrom {
	default = 'default',
}

const pugConfig = {
	pretty: true,
	basedir: path.join(__dirname, '..', '..', 'views', 'emails'),
	cache: config.environment === 'production',
	debug: false,
	compileDebug: false,
};

export function getPugFns(htmlTemplateFilename: string): EmailPugFunctions {
	const filenameParts = htmlTemplateFilename.split('.');
	const ext = filenameParts[filenameParts.length - 1];
	const filenameNoExt = filenameParts.slice(0, -1).join('.');
	const plainTemplateFilename = `${filenameNoExt}.plain.${ext}`;
	return {
		html: existsSync(path.join(pugConfig.basedir, htmlTemplateFilename))
			? pug.compileFile(path.join(pugConfig.basedir, htmlTemplateFilename), pugConfig)
			: undefined,
		plain: existsSync(path.join(pugConfig.basedir, plainTemplateFilename))
			? pug.compileFile(path.join(pugConfig.basedir, plainTemplateFilename), pugConfig)
			: undefined,
	};
}

export function render({ filename, acceptsLanguages, locals }: RendererParams): { html?: string, text?: string } {
	const pugFns = getPugFns(filename);
	return {
		html: pugFns.html?.(prepareLocals(locals, acceptsLanguages)),
		text: pugFns.plain?.(prepareLocals(locals, acceptsLanguages)),
	};
}

export async function send(rendererParams: RendererParams, to: string, subject: string, from: EmailFrom): Promise<void> {
	const rendered = render(rendererParams);
	if (!rendered.html && !rendered.text) {
		throw new SerializableError(`email template not found for "${rendererParams.filename}"`);
	}
	const transporter = nodemailer.createTransport({
		host: config.smtp[from].host,
		port: config.smtp[from].port,
		secure: Boolean(config.smtp[from].ssl),
		auth: {
			user: config.smtp[from].username,
			pass: config.smtp[from].password,
		},
	});
	await transporter.sendMail({
		from: config.smtp[from].from,
		to,
		bcc: config.smtp[from].from, // save a copy, SMTP is a "fire and forget" protocol
		subject: getTranslator(rendererParams.acceptsLanguages)(subject),
		html: rendered.html,
		text: rendered.text,
	});
	transporter.close();
}

function prepareLocals(locals?: Record<string, any>, acceptsLanguages?: string[]): Record<string, any> {
	return {
		...(locals || {}),
		__: getTranslator(acceptsLanguages),
		config,
		BigNumber: BigNumber.clone({
			FORMAT: {
				decimalSeparator: getDecimalSeparator(acceptsLanguages),
			},
		}),
	};
}

interface EmailPugFunctions {
	html?: (locals?: Record<string, any>) => string;
	plain?: (locals?: Record<string, any>) => string;
}

export interface RendererParams {
	filename: string,
	acceptsLanguages?: string[],
	locals?: Record<string, any>,
}

export interface EmailJobData {
	rendererParams: RendererParams,
	to: string,
	subject: string,
	from: EmailFrom,
}
