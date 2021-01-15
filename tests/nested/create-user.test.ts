import { expect } from 'chai';
import { create } from '../../src/services/user';

describe('user creation', () => {
	it('creates a user', (done) => {
		create({
			email: 'hello@test.com',
			enabled: true,
			password: 'password',
		}).then((user) => {
			expect(user).to.have.property('id');
			done();
		}, done);
	});
});
