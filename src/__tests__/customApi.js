'use strict';

import {observer} from '../observer';
import CustomApi from '../customApi';
import {expect} from 'chai';
import ws from 'ws';

describe('CustomApi', function() {
	let api;
	before(function(){
		api = new CustomApi(ws);
	});
	describe('authorize', function(){
		let message;
		before(function(done){
			this.timeout('5000');
			observer.register('api.error', true).then((error)=>{
				message = error;
				done();
			});
			api.authorize('FakeToken');
		});
		it('authorize return invalid token', function() {
			expect(message).to.have.deep.property('.code')
				.that.be.equal('InvalidToken');
		});
	});
	describe('history', function(){
		let message1;
		let message2;
		before(function(done){
			this.timeout('5000');
			observer.register('api.history', true).then((data)=>{
				message1 = data;
			});
			observer.register('api.tick', true).then((data)=>{
				message2 = data;
				done();
			});
			api.history('R_100', {
				"end": "latest",
				"count": 600,
				"subscribe": 1
			});
		});
		it('history return history data', function() {
			expect(message1).to.be.an('Array')
				.that.has.deep.property('.length')
				.that.be.equal(600);
			expect(message2).to.have.all.keys(['epoch', 'quote']);
		});
	});
	describe('buy', function(){
		let message;
		before(function(done){
			this.timeout('5000');
			api.authorize('c9A3gPFcqQtAQDW');
			observer.register('api.authorize', true).then(() => {
				api.buy('uw2mk7no3oktoRVVsB4Dz7TQnFfABuFDgO95dlxfMxRuPUsz', 100);
				return observer.register('api.error', true);
			}).then((error)=>{
				message = error;
				done();
			});
		});
		it('buy return InvalidContractProposal', function() {
			expect(message).to.have.deep.property('.code')
				.that.be.equal('InvalidContractProposal');
		});
	});
});
