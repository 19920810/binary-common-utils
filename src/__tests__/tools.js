import { expect } from 'chai'; // eslint-disable-line import/no-extraneous-dependencies
import { parseQueryString, getObjectValue, getUTCTime } from '../tools';

describe('Misc Tools', () => {
  describe('parseQueryString function', () => {
    let queryString;
    before(() => {
      window.location.search = '?';
      queryString = parseQueryString();
    });
    it('parseQueryString functions detects queryString existance correctly', () => {
      expect(queryString).to.be.empty;
    });
  });
  describe('getObjectValue', () => {
    it('getObjectValue gets the value of an object with one attribute', () => {
      const obj = {
        key: 'value',
      };
      expect(getObjectValue(obj)).to.be.equal('value');
    });
  });
  describe('getUTCTime', () => {
    it('getUTCTime gets the current UTC time with format HH:MM:SS', () => {
      const date = new Date('1990-01-01T01:11:10.000Z');
      expect(getUTCTime(date)).to.be.equal('01:11:10');
    });
  });
});
