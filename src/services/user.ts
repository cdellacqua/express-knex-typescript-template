import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Transaction } from 'knex';
import { transact } from '@cdellacqua/knex-transact';
import config from '../config';
import {
	fromQueryGenerator, findOneGenerator, insertGetId,
} from '../db/utils';
import { uuid } from '../types/common';

const table = 'user';

const columns = [
	'id',
	'email',
	'passwordHash',
	'enabled',
	'minJwtIat',
	'createdAt',
];

export function createJwt(user: User): string {
	const token = jwt.sign({}, config.secret, {
		expiresIn: config.authentication.tokenExpirationSeconds,
		subject: user.id,
	});
	return token;
}

export function generateAuthResponse(user: User): AuthResponse {
	return {
		jwt: createJwt(user),
		user: {
			createdAt: user.createdAt,
			email: user.email,
			enabled: user.enabled,
			id: user.id,
			minJwtIat: user.minJwtIat,
		},
	};
}

function rowMapper(row: any): Promise<User> {
	return Promise.resolve({
		...row,
	});
}

export const find = findOneGenerator(table, columns, (row) => rowMapper(row));

export const fromQuery = fromQueryGenerator<User>(columns, (row) => rowMapper(row));

export function create(user: SaveUser, trx?: Transaction): Promise<User> {
	return transact([
		async (db) => insertGetId(db(table)
			.insert({
				email: user.email.toLowerCase(),
				passwordHash: await bcrypt.hash(user.password, 10),
				enabled: user.enabled,
				minJwtIat: user.minJwtIat || new Date(),
			})),
		(db, id) => find(id, db),
	], trx);
}

export function update(id: string, user: Partial<SaveUser>, trx?: Transaction): Promise<User> {
	return transact([
		async (db) => db(table)
			.where({ id })
			.update({
				email: user.email?.toLowerCase(),
				passwordHash: user.password && await bcrypt.hash(user.password, 10),
				enabled: user.enabled,
				minJwtIat: user.minJwtIat,
			}),
		(db) => find(id, db),
	], trx);
}

export function destroy(id: uuid, trx?: Transaction): Promise <void> {
	return transact(
		(db) => db(table).where({ id }).delete(),
		trx,
	);
}

export async function login({ email, password }: LoginParams): Promise<AuthResponse | null> {
	const user = await find({ email, enabled: true });
	if (!user) {
		return null;
	}
	const passwordMatches = await bcrypt.compare(password, user.passwordHash);
	if (!passwordMatches) {
		return null;
	}
	return generateAuthResponse(user);
}

export interface LoginParams {
	email: string;
	password: string;
}

export interface User {
	id: string;
	email: string;
	passwordHash: string;
	enabled: boolean;
	minJwtIat: Date;
	createdAt: Date;
}

export interface SaveUser {
	email: string;
	password: string;
	enabled: boolean;
	minJwtIat?: Date;
}

export interface AuthResponse {
	jwt: string;
	user: Omit<User, 'passwordHash'>;
}
