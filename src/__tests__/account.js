import { expect } from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import { addTokenIfValid } from '../account';

describe('Account', () => {
  let callbackResult;
  const expected = [{
    account_name: 'VRTC1440189',
    token: 'Xkq6oGFEHh6hJH8',
    isVirtual: true,
    hasRealityCheck: false,
    hasTradeLimitation: false,
  }];
  before(function beforeAll(done) {
    this.timeout('4000');
    addTokenIfValid('Xkq6oGFEHh6hJH8', (result) => {
      callbackResult = result;
      done();
    });
  });
  it('callback result should be null', () => {
    expect(callbackResult)
      .to.be.equal(null);
    expect(JSON.parse(localStorage.tokenList))
      .to.be.deep.equal(expected);
  });
});
