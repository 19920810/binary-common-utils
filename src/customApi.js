'use strict';
import {observer} from './observer';
import {LiveApi} from 'binary-live-api';
import _ from 'underscore';
import {get as getStorage} from './storageManager';

export default class CustomApi {
	constructor(websocketMock, onClose) {
		this.option = {};
		this.proposalMap = {};
		if ( typeof window !== 'undefined' ) {
			this.option = {
				language: getStorage('lang'),
				appId: getStorage('appId'),
			};
		}
		if ( websocketMock ) {
			this.option.websocket = websocketMock;
		} else {
			this.option.keepAlive = true;
		}
		LiveApi.prototype.onClose = (onClose) ? onClose : LiveApi.prototype.onClose;
		let sendRawBackup = LiveApi.prototype.sendRaw;
		LiveApi.prototype.sendRaw = (json) => {
			if ( json.hasOwnProperty('proposal') ) {
				for ( let key in this.proposalMap ) {
					if ( this.proposalMap[key] === json.contract_type ) {
						delete this.proposalMap[key];
					}
				}
				this.proposalMap[json.req_id] = json.contract_type;
			}
			this._originalSendRaw(json);
		};
		this._originalApi = new LiveApi(this.option);
		this._originalSendRaw = sendRawBackup.bind(this._originalApi);
		this.transformers = {
			ohlc: (response, type) => {
				let ohlc = response.ohlc;
				observer.emit('api.ohlc', {
					open: +ohlc.open,
					high: +ohlc.high,
					low: +ohlc.low,
					close: +ohlc.close,
					epoch: +ohlc.open_time,
				});
			},
			candles: (response, type) => {
				let candlesList = [];
				for ( let ohlc of response.candles ) {
					candlesList.push({
						open: +ohlc.open,
						high: +ohlc.high,
						low: +ohlc.low,
						close: +ohlc.close,
						epoch: +ohlc.epoch,
					});
				}
				observer.emit('api.candles', candlesList);
			},
			tick: (response, type) => {
				let tick = response.tick;
				observer.emit('api.tick', {
					epoch: +tick.epoch,
					quote: +tick.quote,
				});
			},
			history: (response, type) => {
				let ticks = [];
				let history = response.history;
				history.times.forEach((time, index) => {
					ticks.push({
						epoch: +time,
						quote: +history.prices[index]
					});
				});
				observer.emit('api.history', ticks);
			},
			error: (response, type) => {
				response.error.type = type;
				observer.emit('api.error', response.error);
			},
			_default: (response, type) => {
				observer.emit('api.' + type, response[type]);
			}
		};
		for ( let e of [ 'error', 'tick', 'ohlc', 'candles', 'history', 'proposal_open_contract', 'proposal', 'buy', 'authorize', 'balance' ] ) {
			/*jshint loopfunc:true*/
			let _event = (!this.transformers[e])? this.transformers._default: this.transformers[e];
			this._originalApi.events.on(e, (data) => {
				if ( this.destroyed ) {
					return;
				}
				if ( data.msg_type === 'proposal' ) {
					data.proposal.contract_type = this.proposalMap[data.req_id];
				}
				_event(data, e);
			});
			/*jshint loopfunc:false*/
		}
	}
	history(...args) {
		return this._originalApi.getTickHistory(...args);
	}
	proposal_open_contract(contract_id) {
		return this._originalApi.send({
			proposal_open_contract: 1,
			contract_id: contract_id,
			subscribe: 1
		});
	}
	proposal(...args) {
		return this._originalApi.subscribeToPriceForContractProposal(...args);
	}
	buy(...args) {
		return this._originalApi.buyContract(...args);
	}
	authorize(...args) {
		return this._originalApi.authorize(...args);
	}
	balance(...args) {
		return this._originalApi.subscribeToBalance(...args);
	}
	destroy() {
		this.destroyed = true;
	}
}

