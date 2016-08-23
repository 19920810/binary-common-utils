'use strict';
import {observer} from '../observer';
import {expect} from 'chai';

describe('Observer', () => {
	before(function(done) {
		observer.register('global.createVar', true).then((obj)=>{
			window[obj.name] = obj.text;
			done();
		});
		setTimeout(() => {
			observer.emit('global.createVar', {
				name: 'newVar',
				text: 'Hello, thanks for defining me'
			});
		}, 1000);
	});
	it('observer should trigger the action defined for an event', () => {
		expect(window.newVar).to.be.a('string')
			.and.to.be.equal('Hello, thanks for defining me');
	});
});
