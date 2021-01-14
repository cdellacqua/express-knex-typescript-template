import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { create } from '../../services/user';

export async function seed(trx: Transaction): Promise<void> {
	return transact([
		(db) => create({
			email: 'user@example.com',
			enabled: true,
			password: 'password',
		}, db),
	], trx);
}
