import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import spies from 'chai-spies';
import logger from '../src/log/logger';
import * as userModule from '../src/services/user';
import { del } from '../src/services/user';

before(() => {
	chai.spy.on(userModule, del.name, () => {
		logger.info('[EXAMPLE] You can alter any module using chai.spy');
		return Promise.resolve();
	});
});
chai.use(spies);

const serverUrl = `http://${process.env.HOST}:${process.env.PORT}`;

const user = {
	email: 'user@example.com',
	password: 'password',
};

chai.use(chaiHttp);

describe('user', () => {
	let jwt = '';
	it('gets jwt', (done) => {
		chai.request(serverUrl)
			.post('/api/user/jwt')
			.send(user)
			.end((err, res) => {
				if (err) done(err);
				expect(res.body).to.haveOwnProperty('jwt');
				jwt = res.body.jwt;
				done();
			});
	});
	it('deletes a user but the function gets intercepted by chai.spy', (done) => {
		chai.request(serverUrl)
			.delete('/api/auth/user')
			.set('Authorization', `Bearer ${jwt}`)
			.end((err, res) => {
				if (err) done(err);
				expect(res.status).to.equal(204);
				done();
			});
	});
});
