import { expect } from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import { removeAllTokens, getTokenList, getToken,
  findToken, removeToken, addToken, isDone, setDone } from '../storageManager';

describe('StorageManager', () => {
  before(() => {
    removeAllTokens();
  });
  describe('token retrieve functions when there is no token', () => {
    it('getTokenList', () => {
      expect(getTokenList()).to.be.empty;
    });
    it('getToken', () => {
      expect(getToken('faketoken')).to.be.empty;
    });
    it('findToken', () => {
      expect(findToken('faketoken')).to.be.below(0);
    });
  });
  describe('token save/retrieve mechanism', () => {
    let realToken;
    before(() => {
      localStorage.tokenList = JSON.stringify([
        {
          account_name: 'Real Account',
          hasRealityCheck: 0,
          token: 'RealToken',
          isVirtual: 0,
        },
      ]);
    });
    it('getTokenList should not be empty', () => {
      expect(getTokenList()).not.to.be.empty;
    });
    it('removeToken fake should not be able to remove real token', () => {
      removeToken('FakeToken');
      expect(getTokenList()).not.to.be.empty;
    });
    it('getToken should be get the real token', () => {
      expect(getToken('RealToken')).to.be.an('Object')
        .that.has.keys(['account_name', 'token', 'isVirtual', 'hasRealityCheck']);
      realToken = getToken('RealToken');
    });
    it('removeToken real should be able to remove real token', () => {
      removeToken('RealToken');
      expect(getTokenList()).to.be.empty;
    });
    it('addToken should be able to add real token and findToken should find it', () => {
      getTokenList(realToken.token, realToken.account_name, 0);
      expect(findToken('RealToken')).not.to.be.empty;
    });
    it('addToken should be able to add real token and findToken should find it', () => {
      addToken(realToken.token, realToken.account_name, 0);
      const tokenList = getTokenList();
      expect(tokenList[findToken('RealToken')])
        .to.be.deep.equal({
        account_name: 'Real Account',
        token: 'RealToken',
        isVirtual: 0,
        hasRealityCheck: 0,
      });
    });
    it('removeAllTokens should remove all tokens and getToken should be empty', () => {
      removeAllTokens();
      expect(getToken('RealToken')).to.be.empty;
    });
  });
  describe('isDone functions', () => {
    it('isDone should be false at the beginning', () => {
      expect(isDone('TokenTest')).not.to.be.ok;
    });
    it('setDone should make it true', () => {
      setDone('TokenTest');
      expect(isDone('TokenTest')).to.be.ok;
    });
  });
});
