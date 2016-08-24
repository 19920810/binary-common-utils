import { observer } from '../observer';
import CustomApi from '../customApi';
import { expect } from 'chai';
import ws from 'ws';

describe('CustomApi', () => {
  let api;
  before(() => {
    api = new CustomApi(ws);
  });
  describe('authorize', () => {
    let message;
    before(function (done) {
      this.timeout('5000');
      observer.register('api.error').then((resp) => {
        message = resp.data;
        done();
      });
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
    before(function (done) {
      this.timeout('5000');
      observer.register('api.history').then((resp) => {
        message1 = resp.data;
      });
      observer.register('api.tick').then((resp) => {
        message2 = resp.data;
        done();
      });
      api.history('R_100', {
        "end": "latest",
        "count": 600,
        "subscribe": 1
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
    before(function (done) {
      this.timeout('5000');
      api.authorize('c9A3gPFcqQtAQDW');
      observer.register('api.authorize').then(() => {
        api.buy('uw2mk7no3oktoRVVsB4Dz7TQnFfABuFDgO95dlxfMxRuPUsz', 100);
        return observer.register('api.error');
      }).then((resp) => {
        message = resp.data;
        done();
      });
    });
    it('buy return InvalidContractProposal', () => {
      expect(message).to.have.deep.property('.code')
        .that.be.equal('InvalidContractProposal');
    });
  });
});
