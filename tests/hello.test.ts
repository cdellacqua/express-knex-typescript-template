// TODO: remove this test

import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import config from '../src/config';

const serverUrl = config.http.baseUrl;

chai.use(chaiHttp);

describe('hello', () => {
	it('gets ssr hello', (done) => {
		chai.request(serverUrl)
			.get('/hello-ssr')
			.end((err, res) => {
				if (err) done(err);
				expect(res.text).to.contain('World');
				expect(res.text).to.contain(`<html lang="${config.product.locale}"`);
				done();
			});
	});
	it('gets api hello', (done) => {
		chai.request(serverUrl)
			.get('/hello-api')
			.end((err, res) => {
				if (err) done(err);
				expect(res.text).to.equals('hello, World!');
				done();
			});
	});
});
