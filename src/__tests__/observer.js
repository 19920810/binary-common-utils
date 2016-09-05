import { expect } from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import { observer } from '../observer';

let global = {};
describe('Observer', () => {
  before(function beforeAll(done) { // eslint-disable-line prefer-arrow-callback
    observer.register('global.createVar', (obj) => {
      global[obj.name] = obj.text;
      done();
    }, true);
    setTimeout(() => {
      observer.emit('global.createVar', {
        name: 'newVar',
        text: 'Hello, thanks for defining me',
      });
    }, 1000);
  });
  it('observer should trigger the action defined for an event', () => {
    expect(global.newVar).to.be.a('string')
      .and.to.be.equal('Hello, thanks for defining me');
  });
});
