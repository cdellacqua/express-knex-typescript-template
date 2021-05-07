import chai from 'chai';
import spies from 'chai-spies';
import * as emailModule from '../src/email';
import { getTranslator } from '../src/i18n';
import { enqueueEmail, workers } from '../src/queue';
import logger from '../src/log/logger';

chai.use(spies);

before(() => {
	chai.spy.on(emailModule, emailModule.send.name, () => {
		logger.info('[ FAKE ] Email sent');
		return Promise.resolve();
	});
});
after(() => {
	chai.spy.restore(emailModule);
});

describe('queue', () => {
	it('enqueues an email', (done) => {
		enqueueEmail({
			from: emailModule.EmailFrom.default,
			rendererParams: {
				filename: 'email-verification.pug',
			},
			subject: getTranslator()('Verify your Email!'),
			to: 'user@example.com',
		}).then(() => {
			workers.email.on('completed', () => done());
			workers.email.on('failed', (_, err) => done(err));
		});
	});
});
