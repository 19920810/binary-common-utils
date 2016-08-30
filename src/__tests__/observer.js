import { observer } from '../observer';
import { expect } from 'chai';

describe('Observer', () => {
	describe('Observe Once', () => {
		let global = {};
		before(async function() {
			setTimeout(() => {
				observer.emit('global.createVar', {
					name: 'newVar',
					text: 'Hello, thanks for defining me'
				});
			}, 1000);
			let rsp = ((await observer.register('global.createVar')).data);
			global[rsp.name] = rsp.text;
		});
		it('observer should trigger the action defined for an event', () => {
			expect(global.newVar).to.be.a('string')
				.and.to.be.equal('Hello, thanks for defining me');
		});
	});
	describe('Observe Forever', () => {
		let products = [];
		before(async function() {
			this.timeout('5000');
			setInterval(() => {
				observer.emit('global.product', {
					name: 'newVar',
					text: 'Hello, thanks for defining me'
				});
			}, 1000);
			let timer = 0;
			await observer.keepAlive(observer.register('global.product'), (p) => {
				if ( ++timer === 3 ) {
					observer.unregisterAll('global.product');
				}
				products.push(p);
			});
		});
		it('observer should trigger the action defined for an event', () => {
			expect(products.length).to.be.equal(3);
		});
	});
});
