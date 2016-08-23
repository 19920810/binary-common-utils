'use strict';
import {addTokenIfValid} from '../account';
import {expect} from 'chai';

describe('Account', () => {
	let callbackResult;
	before(function(done) {
		this.timeout('3000');
		localStorage.tokenList = [
			{
				account_name: 'Virtual Account',
				token: 'c9A3gPFcqQtAQDW',
				isVirtual: 1
			}
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
