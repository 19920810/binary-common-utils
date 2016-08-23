'use strict';
import {expect} from 'chai';
import {removeAllTokens, getTokenList, getToken, findToken, removeToken, addToken, isDone, setDone} from '../storageManager';

describe('StorageManager', function(){
	before(function(){
		removeAllTokens();
	});
	describe('token retrieve functions when there is no token', function(){
		it('getTokenList', function(){
			expect(getTokenList()).to.be.empty;
		});
		it('getToken', function(){
			expect(getToken('faketoken')).to.be.empty;
		});
		it('findToken', function(){
			expect(findToken('faketoken')).to.be.below(0);
		});
	});
	describe('token save/retrieve mechanism', function(){
		var realToken;
		before(function(){
			localStorage.tokenList = JSON.stringify([
				{
					account_name: 'Real Account',
					token: 'RealToken',
					isVirtual: 0
				}
			]);
		});
		it('getTokenList should not be empty', function(){
			expect(getTokenList()).not.to.be.empty;
		});
		it('removeToken fake should not be able to remove real token', function(){
			removeToken('FakeToken');
			expect(getTokenList()).not.to.be.empty;
		});
		it('getToken should be get the real token', function(){
			expect(getToken('RealToken')).to.be.an('Object')
				.that.has.keys(['account_name', 'token', 'isVirtual']);
			realToken = getToken('RealToken');
		});
		it('removeToken real should be able to remove real token', function(){
			removeToken('RealToken');
			expect(getTokenList()).to.be.empty;
		});
		it('addToken should be able to add real token and findToken should find it', function(){
			getTokenList(realToken.token, realToken.account_name, 0);
			expect(findToken('RealToken')).not.to.be.empty;
		});
		it('addToken should be able to add real token and findToken should find it', function(){
			addToken(realToken.token, realToken.account_name, 0);
			var tokenList = getTokenList();
			expect(tokenList[findToken('RealToken')])
				.to.be.deep.equal({
					account_name: 'Real Account',
					token: 'RealToken',
					isVirtual: 0
				});
		});
		it('removeAllTokens should remove all tokens and getToken should be empty', function(){
			removeAllTokens();
			expect(getToken('RealToken')).to.be.empty;
		});
	});
	describe('isDone functions', function(){
		it('isDone should be false at the beginning', function(){
			expect(isDone('TokenTest')).not.to.be.ok;
		});
		it('setDone should make it true', function(){
			setDone('TokenTest');
			expect(isDone('TokenTest')).to.be.ok;
		});
	});
});
