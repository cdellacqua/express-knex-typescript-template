import { expect } from 'chai';
import { create, del, User } from '../../src/services/user';

describe('user creation', () => {
	let user: User;
	it('creates and deletes a user', async () => {
		user = await create({
			email: 'hello@test.com',
			enabled: true,
			password: 'password',
			minJwtIat: new Date(),
		});
		expect(user).to.have.property('id');
		await del(user.id);
	});
});
