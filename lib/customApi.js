'use strict';

var _observer = require('./observer');

var _binaryLiveApi = require('binary-live-api');

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _storageManager = require('./storageManager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CustomApi = function CustomApi(websocketMock, onClose) {
	var option = {};
	this.proposalMap = {};
	if (typeof window !== 'undefined') {
		option = {
			language: (0, _storageManager.get)('lang'),
			appId: (0, _storageManager.get)('appId')
		};
	}
	if (websocketMock) {
		option.websocket = websocketMock;
	} else {
		option.keepAlive = true;
	}
	var events = {
		tick: function tick() {},
		ohlc: function ohlc() {},
		candles: function candles() {},
		history: function history() {
			return this._originalApi.getTickHistory.apply(this._originalApi, Array.prototype.slice.call(arguments));
		},
		proposal_open_contract: function proposal_open_contract(contract_id) {
			return this._originalApi.send({
				proposal_open_contract: 1,
				contract_id: contract_id,
				subscribe: 1
			});
		},
		proposal: function proposal() {
			return this._originalApi.subscribeToPriceForContractProposal.apply(this._originalApi, Array.prototype.slice.call(arguments));
		},
		buy: function buy() {
			return this._originalApi.buyContract.apply(this._originalApi, Array.prototype.slice.call(arguments));
		},
		authorize: function authorize() {
			return this._originalApi.authorize.apply(this._originalApi, Array.prototype.slice.call(arguments));
		},
		balance: function balance() {
			return this._originalApi.subscribeToBalance.apply(this._originalApi, Array.prototype.slice.call(arguments));
		}
	};
	var that = this;
	if (onClose) {
		_binaryLiveApi.LiveApi.prototype.onClose = onClose;
	}
	_binaryLiveApi.LiveApi.prototype.sendRaw = function sendRaw(json) {
		if (json.hasOwnProperty('proposal')) {
			for (var key in that.proposalMap) {
				if (that.proposalMap[key] === json.contract_type) {
					delete that.proposalMap[key];
				}
			}
			that.proposalMap[json.req_id] = json.contract_type;
		}
		if (this.isReady()) {
			this.socket.send(JSON.stringify(json));
		} else {
			this.bufferedSends.push(json);
		}
		if (typeof json.req_id !== 'undefined') {
			return this.generatePromiseForRequest(json);
		}
	};
	this._originalApi = new _binaryLiveApi.LiveApi(option);
	Object.keys(events).forEach(function (e) {
		var _event = (!that.events[e] ? that.events._default : that.events[e]).bind(that);
		that._originalApi.events.on(e, function (data) {
			if (that.destroyed) {
				return;
			}
			if (data.msg_type === 'proposal') {
				data.proposal.contract_type = that.proposalMap[data.req_id];
			}
			_event(data, e);
		});
		that[e] = function () {
			var promise = events[e].apply(that, Array.prototype.slice.call(arguments));
			if (promise instanceof Promise) {
				promise.then(function resolve(data) {}, function reject(data) {
					_event(data.error, e);
				});
			}
		};
	});
};

CustomApi.prototype = Object.create(_binaryLiveApi.LiveApi.prototype, {
	apiFailed: {
		value: function apiFailed(response, type) {
			if (response.error) {
				response.error.type = type;
				_observer.observer.emit('api.error', response.error);
				return true;
			}
			return false;
		}
	},
	events: {
		value: {
			ohlc: function ohlc(response, type) {
				if (!this.apiFailed(response, type)) {
					var ohlc = response.ohlc;
					_observer.observer.emit('api.ohlc', {
						open: +ohlc.open,
						high: +ohlc.high,
						low: +ohlc.low,
						close: +ohlc.close,
						epoch: +ohlc.open_time
					});
				}
			},
			candles: function candles(response, type) {
				if (!this.apiFailed(response, type)) {
					var candlesList = [];
					var candles = response.candles;
					candles.forEach(function (ohlc) {
						candlesList.push({
							open: +ohlc.open,
							high: +ohlc.high,
							low: +ohlc.low,
							close: +ohlc.close,
							epoch: +ohlc.epoch
						});
					});
					_observer.observer.emit('api.candles', candlesList);
				}
			},
			tick: function tick(response, type) {
				if (!this.apiFailed(response, type)) {
					var tick = response.tick;
					_observer.observer.emit('api.tick', {
						epoch: +tick.epoch,
						quote: +tick.quote
					});
				}
			},
			history: function history(response, type) {
				if (!this.apiFailed(response, type)) {
					var ticks = [];
					var history = response.history;
					history.times.forEach(function (time, index) {
						ticks.push({
							epoch: +time,
							quote: +history.prices[index]
						});
					});
					_observer.observer.emit('api.history', ticks);
				}
			},
			authorize: function authorize(response, type) {
				if (!this.apiFailed(response, type)) {
					_observer.observer.emit('api.authorize', response.authorize);
				}
			},
			_default: function _default(response, type) {
				if (!this.apiFailed(response, type)) {
					_observer.observer.emit('api.log', response);
					_observer.observer.emit('api.' + type, response[type]);
				}
			}
		}
	},
	destroy: {
		value: function destroy() {
			this.destroyed = true;
		}
	}
});

module.exports = CustomApi;