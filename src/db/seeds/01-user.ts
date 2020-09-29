import { transact } from '@cdellacqua/knex-transact';
import { container } from 'tsyringe';
import { UserService } from '../../services/user';

export async function seed(): Promise<void> {
	return transact([
		(db) => container.resolve(UserService).create({
			email: 'user@example.com',
			enabled: true,
			password: 'password',
		}, db),
	]);
}
