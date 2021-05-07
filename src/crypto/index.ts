import bcrypt from 'bcryptjs';
import cryptoExtra from 'crypto-extra';
import { promisify } from 'util';
import crypto from 'crypto';
import config from '../config';

const randomBytes = promisify(crypto.randomBytes);

export async function hash(data: string): Promise<string> {
	return bcrypt.hash(data, 10);
}

export async function hashCheck(data: string, providedHash: string): Promise<boolean> {
	return bcrypt.compare(data, providedHash);
}

export function encrypt(data: string | object): string {
	return cryptoExtra.encrypt(data, config.secret);
}

export function randomHex(bytes?: number): Promise<string> {
	return randomBytes(bytes || 10).then((buf) => buf.toString('hex'));
}

export function decrypt(data: string): any {
	return cryptoExtra.decrypt(data, config.secret);
}
