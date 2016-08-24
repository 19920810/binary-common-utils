'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _observer = require('./observer');

var _binaryLiveApi = require('binary-live-api');

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _storageManager = require('./storageManager');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CustomApi = function () {
	function CustomApi(websocketMock, onClose) {
		var _this = this;

		_classCallCheck(this, CustomApi);

		this.option = {};
		this.proposalMap = {};
		if (typeof window !== 'undefined') {
			this.option = {
				language: (0, _storageManager.get)('lang'),
				appId: (0, _storageManager.get)('appId')
			};
		}
		if (websocketMock) {
			this.option.websocket = websocketMock;
		} else {
			this.option.keepAlive = true;
		}
		_binaryLiveApi.LiveApi.prototype.onClose = onClose ? onClose : _binaryLiveApi.LiveApi.prototype.onClose;
		var sendRawBackup = _binaryLiveApi.LiveApi.prototype.sendRaw;
		_binaryLiveApi.LiveApi.prototype.sendRaw = function (json) {
			if (json.hasOwnProperty('proposal')) {
				for (var key in _this.proposalMap) {
					if (_this.proposalMap[key] === json.contract_type) {
						delete _this.proposalMap[key];
					}
				}
				_this.proposalMap[json.req_id] = json.contract_type;
			}
			_this._originalSendRaw(json);
		};
		this._originalApi = new _binaryLiveApi.LiveApi(this.option);
		this._originalSendRaw = sendRawBackup.bind(this._originalApi);
		this.transformers = {
			ohlc: function ohlc(response, type) {
				var ohlc = response.ohlc;
				_observer.observer.emit('api.ohlc', {
					open: +ohlc.open,
					high: +ohlc.high,
					low: +ohlc.low,
					close: +ohlc.close,
					epoch: +ohlc.open_time
				});
			},
			candles: function candles(response, type) {
				var candlesList = [];
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = response.candles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var ohlc = _step.value;

						candlesList.push({
							open: +ohlc.open,
							high: +ohlc.high,
							low: +ohlc.low,
							close: +ohlc.close,
							epoch: +ohlc.epoch
						});
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator.return) {
							_iterator.return();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				_observer.observer.emit('api.candles', candlesList);
			},
			tick: function tick(response, type) {
				var tick = response.tick;
				_observer.observer.emit('api.tick', {
					epoch: +tick.epoch,
					quote: +tick.quote
				});
			},
			history: function history(response, type) {
				var ticks = [];
				var history = response.history;
				history.times.forEach(function (time, index) {
					ticks.push({
						epoch: +time,
						quote: +history.prices[index]
					});
				});
				_observer.observer.emit('api.history', ticks);
			},
			error: function error(response, type) {
				response.error.type = type;
				_observer.observer.emit('api.error', response.error);
			},
			_default: function _default(response, type) {
				_observer.observer.emit('api.' + type, response[type]);
			}
		};
		var _arr = ['error', 'tick', 'ohlc', 'candles', 'history', 'proposal_open_contract', 'proposal', 'buy', 'authorize', 'balance'];

		var _loop = function _loop() {
			var e = _arr[_i];
			/*jshint loopfunc:true*/
			var _event = !_this.transformers[e] ? _this.transformers._default : _this.transformers[e];
			_this._originalApi.events.on(e, function (data) {
				if (_this.destroyed) {
					return;
				}
				if (data.msg_type === 'proposal') {
					data.proposal.contract_type = _this.proposalMap[data.req_id];
				}
				_event(data, e);
			});
			/*jshint loopfunc:false*/
		};

		for (var _i = 0; _i < _arr.length; _i++) {
			_loop();
		}
	}

	_createClass(CustomApi, [{
		key: 'history',
		value: function history() {
			var _originalApi;

			return (_originalApi = this._originalApi).getTickHistory.apply(_originalApi, arguments);
		}
	}, {
		key: 'proposal_open_contract',
		value: function proposal_open_contract(contract_id) {
			return this._originalApi.send({
				proposal_open_contract: 1,
				contract_id: contract_id,
				subscribe: 1
			});
		}
	}, {
		key: 'proposal',
		value: function proposal() {
			var _originalApi2;

			return (_originalApi2 = this._originalApi).subscribeToPriceForContractProposal.apply(_originalApi2, arguments);
		}
	}, {
		key: 'buy',
		value: function buy() {
			var _originalApi3;

			return (_originalApi3 = this._originalApi).buyContract.apply(_originalApi3, arguments);
		}
	}, {
		key: 'authorize',
		value: function authorize() {
			var _originalApi4;

			return (_originalApi4 = this._originalApi).authorize.apply(_originalApi4, arguments);
		}
	}, {
		key: 'balance',
		value: function balance() {
			var _originalApi5;

			return (_originalApi5 = this._originalApi).subscribeToBalance.apply(_originalApi5, arguments);
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			this.destroyed = true;
		}
	}]);

	return CustomApi;
}();

exports.default = CustomApi;