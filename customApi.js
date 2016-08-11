'use strict';
var Observer = require('./observer');
var LiveApi = require('binary-live-api').LiveApi;
var _ = require('underscore');

var CustomApi = function CustomApi(websocketMock, onClose) {
	var option = {};
	this.requestMap = {};
	this.observer = new Observer();
	if ( typeof window !== 'undefined' ) {
		var storageManager = require('./storageManager');
		option = {
			language: storageManager.get('lang'),
			appId: storageManager.get('appId'),
			keepAlive: true
		};
	}
	if ( websocketMock ) {
		option.websocket = websocketMock;
	}
	var events = {
		tick: function(){},
		ohlc: function(){},
		candles: function(){},
		history: function(){
			return this._originalApi.getTickHistory.apply(this._originalApi, Array.prototype.slice.call(arguments));
		},
		proposal_open_contract: function(contract_id){
			return this._originalApi.send({
				proposal_open_contract: 1,
				contract_id: contract_id,
				subscribe: 1
			});
		},
		proposal: function(){
			return this._originalApi.subscribeToPriceForContractProposal.apply(this._originalApi, Array.prototype.slice.call(arguments));
		},
		buy: function(){
			return this._originalApi.buyContract.apply(this._originalApi, Array.prototype.slice.call(arguments));
		},
		authorize: function(){
			return this._originalApi.authorize.apply(this._originalApi, Array.prototype.slice.call(arguments));
		},
		balance: function(){
			return this._originalApi.subscribeToBalance.apply(this._originalApi, Array.prototype.slice.call(arguments));
		},
	};
	var that = this;
	if ( onClose ) {
		LiveApi.prototype.onClose = onClose;
	}
	LiveApi.prototype.sendRaw = function sendRaw(json){
		that.requestMap[json.req_id] = json;
		if (this.isReady()) {
			this.socket.send(JSON.stringify(json));
		} else {
			this.bufferedSends.push(json);
		}    
		if (typeof json.req_id !== 'undefined') {
			return this.generatePromiseForRequest(json);
		}    
	};
	this._originalApi = new LiveApi(option);
	Object.keys(events).forEach(function(e){
		var _event = ((!that.events[e])? that.events._default: that.events[e]).bind(that);
		that._originalApi.events.on(e, function(data){
			if ( that.destroyed ) {
				return;
			}
			data.echo_req = that.requestMap[data.req_id];
			_event(data, e);
		});
		that[e] = function(){
			var promise = events[e].apply(that, Array.prototype.slice.call(arguments));
			if ( promise instanceof Promise ) {
				promise.then(function resolve(data){
				}, function reject(data){
					_event(data.error, e);
				});
			}
		};
	});
};

CustomApi.prototype = Object.create(LiveApi.prototype, {
	apiFailed:{
		value: function apiFailed(response, type){
			if (response.error) {
				response.error.type = type;
				this.observer.emit('api.error', response.error);
				return true;
			}
			return false;
		}
	},
	events: {
		value: {
			ohlc: function ohlc(response, type) {
				if ( !this.apiFailed(response, type) ) {
					var ohlc = response.ohlc;
					this.observer.emit('api.ohlc', {
						open: +ohlc.open,
						high: +ohlc.high,
						low: +ohlc.low,
						close: +ohlc.close,
						epoch: +ohlc.open_time,
					});
				}
			},
			candles: function candles(response, type) {
				if ( !this.apiFailed(response, type) ) {
					var candlesList = [];
					var candles = response.candles;
					candles.forEach(function (ohlc) {
						candlesList.push({
							open: +ohlc.open,
							high: +ohlc.high,
							low: +ohlc.low,
							close: +ohlc.close,
							epoch: +ohlc.epoch,
						});
					});
					this.observer.emit('api.candles', candlesList);
				}
			},
			tick: function tick(response, type) {
				if ( !this.apiFailed(response, type) ) {
					var tick = response.tick;
					this.observer.emit('api.tick', {
						epoch: +tick.epoch,
						quote: +tick.quote,
					});
				}
			},
			history: function history(response, type) {
				if ( !this.apiFailed(response, type) ) {
					var ticks = [];
					var history = response.history;
					history.times.forEach(function (time, index) {
						ticks.push({
							epoch: +time,
							quote: +history.prices[index]
						});
					});
					this.observer.emit('api.history', ticks);
				}
			},
			authorize: function authorize(response, type) {
				if ( !this.apiFailed(response, type) ) {
					this.observer.emit('api.authorize', response.authorize);
				}
			},
			proposal: function _default(response, type) {
				if ( !this.apiFailed(response, type) ) {
					this.observer.emit('api.proposal', _.extend(response.proposal, {contract_type: response.echo_req.contract_type}));
				}
			},
			_default: function _default(response, type) {
				if ( !this.apiFailed(response, type) ) {
					this.observer.emit('api.log', response);
					this.observer.emit('api.' + type, response[type]);
				}
			},
		}
	},
	destroy: {
		value: function destroy() {
			this.destroyed = true;
		}
	}
});

module.exports = CustomApi;
