import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';

const serverUrl = `http://${process.env.HOST}:${process.env.PORT}`;

chai.use(chaiHttp);


before(() => {
	console.log('before');
});

describe('hello', () => {
	it('gets ssr hello', (done) => {
		chai.request(serverUrl)
			.get('/')
			.end((err, res) => {
				if (err) done(err);
				expect(res.text).to.contain('World');
				done();
			});
	});
});
