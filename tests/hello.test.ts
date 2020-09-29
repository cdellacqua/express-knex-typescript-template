import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

import dotenv from 'dotenv';
import server from '../src';
import knex from '../src/db';

dotenv.config();

const serverUrl = `http://${process.env.HOST}:${process.env.PORT}`;

chai.use(chaiHttp);

describe('hello', () => {
	it('gets ssr hello', (done) => {
		chai.request(serverUrl)
			.get('/hello')
			.end((err, res) => {
				if (err) done(err);
				expect(res.text).to.contain('World');
				done();
			});
	});
	it('gets api hello', (done) => {
		chai.request(serverUrl)
			.get('/api/hello')
			.end((err, res) => {
				if (err) done(err);
				expect(res.text).to.contain('world');
				done();
			});
	});
});

after((done) => {
	server.close(() => knex.destroy(() => done()));
});
