import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import spies from 'chai-spies';
import { HttpStatus } from '../../src/http/status';
import logger from '../../src/log/logger';
import * as userModule from '../../src/services/user';
import config from '../../src/config';

chai.use(spies);

const serverUrl = config.http.baseUrl;

const user = {
	email: 'user@example.com',
	password: 'password',
};

chai.use(chaiHttp);

describe('user', () => {
	before(() => {
		chai.spy.on(userModule, userModule.del.name, () => {
			logger.info('[EXAMPLE] You can alter any module using chai.spy');
			return Promise.resolve();
		});
	});
	after(() => {
		chai.spy.restore(userModule);
	});

	let jwt = '';
	it('gets jwt', (done) => {
		chai.request(serverUrl)
			.post('/user/jwt')
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
			.delete('/auth/user')
			.set('Authorization', `Bearer ${jwt}`)
			.end((err, res) => {
				if (err) done(err);
				expect(res.status).to.equal(HttpStatus.NoContent);
				done();
			});
	});
});
