import { expect } from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import { logoutAllTokens, addTokenIfValid } from '../account';

describe('Account', () => {
  describe('Login', () => {
    let successfulLogin;
    const expected = [{
      account_name: 'VRTC1440189',
      token: 'Xkq6oGFEHh6hJH8',
      isVirtual: true,
      hasRealityCheck: false,
      hasTradeLimitation: false,
    }];
    before(function beforeAll(done) {
      this.timeout('4000');
      addTokenIfValid('Xkq6oGFEHh6hJH8').then(() => {
        successfulLogin = true;
        done();
      });
    });
    it('Login should be successful', () => {
      expect(successfulLogin).to.be.equal(true);
      expect(JSON.parse(localStorage.tokenList))
        .to.be.deep.equal(expected);
    });
  });
  describe('logout', () => {
    let successfulLogout;
    before(function beforeAll(done) {
      this.timeout('4000');
      logoutAllTokens().then(() => {
        successfulLogout = true;
        done();
      });
    });
    it('Logout should be successful', () => {
      expect(successfulLogout).to.be.equal(true);
      expect(localStorage.tokenList)
        .not.to.be.ok;
    });
  });
});
