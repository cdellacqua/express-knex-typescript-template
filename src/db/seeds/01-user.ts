import { transact } from '@cdellacqua/knex-transact';
import { Knex } from 'knex';
import { create } from '../../services/user';

export async function seed(trx: Knex.Transaction): Promise<void> {
	return transact([
		(db) => create({
			email: 'user@example.com',
			enabled: true,
			password: 'password',
			minJwtIat: new Date(),
		}, db),
	], trx);
}
