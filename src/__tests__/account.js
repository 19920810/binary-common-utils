import { expect } from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import { addTokenIfValid } from '../account';

describe('Account', () => {
  let callbackResult;
  const expected = [{
    account_name: 'VRTC1339394',
    token: process.env.TESTINGTOKEN,
    isVirtual: true,
    hasRealityCheck: false,
    hasTradeLimitation: false,
  }];
  before(function beforeAll(done) {
    this.timeout('4000');
    addTokenIfValid(process.env.TESTINGTOKEN, (result) => {
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
