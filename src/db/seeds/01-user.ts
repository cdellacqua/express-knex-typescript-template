import { transact } from '@cdellacqua/knex-transact';
import { Transaction } from 'knex';
import { container } from 'tsyringe';
import { UserService } from '../../services/user';

export async function seed(trx: Transaction): Promise<void> {
	return transact([
		(db) => container.resolve(UserService).create({
			email: 'user@example.com',
			enabled: true,
			password: 'password',
		}, db),
	], trx);
}
