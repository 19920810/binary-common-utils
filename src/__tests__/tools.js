'use strict';
import {expect} from 'chai';
import {observer} from '../observer';
import {parseQueryString, getObjectValue, getUTCTime} from '../tools';

describe('Misc Tools', function(){
	describe('parseQueryString function', function(){
		var queryString;
		before(function(){
			window.location.search = '?';
			queryString = parseQueryString();
		});
		it('parseQueryString functions detects queryString existance correctly', function(){
			expect(queryString).to.be.empty;
		});
	});
	describe('getObjectValue', function(){
		it('getObjectValue gets the value of an object with one attribute', function(){
			var obj = {key: 'value'};
			expect(getObjectValue(obj)).to.be.equal('value');
		});
	});
	describe('getUTCTime', function(){
		it('getUTCTime gets the current UTC time with format HH:MM:SS', function(){
			var date = new Date('1990-01-01T01:11:10.000Z');
			expect(getUTCTime(date)).to.be.equal('01:11:10');
		});
	});
});
