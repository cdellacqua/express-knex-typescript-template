import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { HttpStatus } from '../src/http/status';

const serverUrl = `http://${process.env.HOST}:${process.env.PORT}`;

const user = {
	email: 'user@example.com',
	password: 'password',
};

chai.use(chaiHttp);

describe('user', () => {
	let jwt = '';
	it('fails to get a jwt', (done) => {
		chai.request(serverUrl)
			.post('/api/user/jwt')
			.send({
				email: 'not-a-valid-email.address',
				password: undefined,
			})
			.end((err, res) => {
				if (err) done(err);
				expect(res.status).equals(HttpStatus.UnprocessableEntity);
				expect(res.body).to.be.instanceOf(Array);
				expect(res.body[0].msg).equals('Invalid value');
				done();
			});
	});
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
	it('renews jwt', (done) => {
		chai.request(serverUrl)
			.post('/api/auth/user/jwt')
			.set('Authorization', `Bearer ${jwt}`)
			.end((err, res) => {
				if (err) done(err);
				expect(res.body).to.haveOwnProperty('jwt');
				done();
			});
	});
	it('gets a private route with auth token', (done) => {
		chai.request(serverUrl)
			.get('/api/auth/goodbye')
			.set('Authorization', `Bearer ${jwt}`)
			.end((err, res) => {
				if (err) done(err);
				expect(res.text).to.equal(`goodbye ${user.email}`);
				done();
			});
	});
	it('cannot get a private route without auth token', (done) => {
		chai.request(serverUrl)
			.get('/api/auth/goodbye')
			.end((err, res) => {
				if (err) done(err);
				expect(res.status).to.equal(HttpStatus.Unauthorized);
				done();
			});
	});
	it('deletes a user', (done) => {
		chai.request(serverUrl)
			.delete('/api/auth/user')
			.set('Authorization', `Bearer ${jwt}`)
			.end((err, res) => {
				if (err) done(err);
				expect(res.status).to.equal(HttpStatus.NoContent);
				done();
			});
	});
});
