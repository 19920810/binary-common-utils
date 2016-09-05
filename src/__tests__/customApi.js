import { expect } from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import ws from 'ws'; // eslint-disable-line import/no-extraneous-dependencies
import { observer } from '../observer';
import CustomApi from '../customApi.js';

describe('CustomApi', () => {
  let api;
  before(() => {
    api = new CustomApi(ws);
  });
  describe('authorize', () => {
    let message;
    before(function beforeall(done) {
      this.timeout('5000');
      observer.register('api.error', (error) => {
        message = error;
        done();
      }, true);
      api.authorize('FakeToken');
    });
    it('authorize return invalid token', () => {
      expect(message).to.have.deep.property('.code')
        .that.be.equal('InvalidToken');
    });
  });
  describe('history', () => {
    let message1;
    let message2;
    before(function beforeAll(done) {
      this.timeout('5000');
      observer.register('api.history', (data) => {
        message1 = data;
      }, true);
      observer.register('api.tick', (data) => {
        message2 = data;
        done();
      }, true);
      api.history('R_100', {
        end: 'latest',
        count: 600,
        subscribe: 1,
      });
    });
    it('history return history data', () => {
      expect(message1).to.be.an('Array')
        .that.has.deep.property('.length')
        .that.be.equal(600);
      expect(message2).to.have.all.keys(['epoch', 'quote']);
    });
  });
  describe('buy', () => {
    let message;
    before(function beforeAll(done) {
      this.timeout('5000');
      observer.register('api.authorize', () => {
        observer.register('api.error', (error) => {
          message = error;
          done();
        }, true);
        api.buy('uw2mk7no3oktoRVVsB4Dz7TQnFfABuFDgO95dlxfMxRuPUsz', 100);
      }, true);
      api.authorize('nmjKBPWxM00E8Fh');
    });
    it('buy return InvalidContractProposal', () => {
      expect(message).to.have.deep.property('.code')
        .that.be.equal('InvalidContractProposal');
    });
  });
});
