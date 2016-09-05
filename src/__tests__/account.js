import { expect } from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import { addTokenIfValid } from '../account';

describe('Account', () => {
	let callbackResult;
	before(function beforeAll(done) {
		this.timeout('3000');
		localStorage.tokenList = [
			{
				account_name: 'Virtual Account',
				token: 'nmjKBPWxM00E8Fh',
				isVirtual: 1,
			},
		];
		addTokenIfValid('FakeToken', (result) => {
			callbackResult = result;
			done();
		});
	});
	it('callback result should be error', () => {
		expect(callbackResult).to.be.a('string')
			.and.to.be.equal('Error');
	});
});
