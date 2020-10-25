import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Transaction } from 'knex';
import { transact } from '@cdellacqua/knex-transact';
import config from '../config';
import {
	fromQueryGenerator, findOneGenerator, insertGetId,
} from '../db/utils';
import { uuid } from '../types/common';

export class UserService {
	table = 'user';

	columns = [
		'id',
		'email',
		'passwordHash',
		'enabled',
		'minJwtIat',
		'createdAt',
	];

	async login({ email, password }: LoginParams): Promise<AuthResponse | null> {
		const user = await this.find({ email });
		if (!user) {
			return null;
		}
		const passwordMatches = await bcrypt.compare(password, user.passwordHash);
		if (!passwordMatches) {
			return null;
		}
		return this.generateAuthResponse(user);
	}

	generateAuthResponse(user: User): AuthResponse {
		return {
			jwt: this.createJwt(user),
			user: {
				createdAt: user.createdAt,
				email: user.email,
				enabled: user.enabled,
				id: user.id,
				minJwtIat: user.minJwtIat,
			},
		};
	}

	createJwt(user: User): string {
		const token = jwt.sign({}, config.secret, {
			expiresIn: config.authentication.tokenExpirationSeconds,
			subject: user.id,
		});
		return token;
	}

	private rowMapper(row: any): Promise<User> {
		return Promise.resolve({
			...row,
		});
	}

	find = findOneGenerator(this.table, this.columns, (row) => this.rowMapper(row));

	fromQuery = fromQueryGenerator<User>(this.columns, (row) => this.rowMapper(row));

	create(user: SaveUser, trx?: Transaction): Promise<User> {
		return transact([
			async (db) => insertGetId(db(this.table)
				.insert({
					email: user.email.toLowerCase(),
					passwordHash: await bcrypt.hash(user.password, 10),
					enabled: user.enabled,
					minJwtIat: user.minJwtIat || new Date(),
				})),
			(db, id) => this.find(id, db),
		], trx);
	}

	update(id: string, user: Partial<SaveUser>, trx?: Transaction): Promise<User> {
		return transact([
			async (db) => db(this.table)
				.where({ id })
				.update({
					email: user.email?.toLowerCase(),
					passwordHash: user.password && await bcrypt.hash(user.password, 10),
					enabled: user.enabled,
					minJwtIat: user.minJwtIat,
				}),
			(db) => this.find(id, db),
		], trx);
	}

	delete(id: uuid, trx?: Transaction): Promise<void> {
		return transact(
			(db) => db(this.table).where({ id }).delete(),
			trx,
		);
	}
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
