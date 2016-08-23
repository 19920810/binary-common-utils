'use strict';
import {observer} from '../observer';
var expect = require('chai').expect;

describe('Observer', function(){
	before(function(done){
		observer.register('global.createVar', function(obj){
			window[obj.name] = obj.text;
			done();
		}, true);
		setTimeout(function(){
			observer.emit('global.createVar', {
				name: 'newVar',
				text: 'Hello, thanks for defining me'
			});
		}, 1000);
	});
	it('observer should trigger the action defined for an event', function(){
		expect(window.newVar).to.be.a('string')
			.and.to.be.equal('Hello, thanks for defining me');
	});
});
