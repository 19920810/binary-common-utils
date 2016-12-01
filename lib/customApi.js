'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _binaryLiveApi = require('binary-live-api');

var _observer = require('./observer');

var _storageManager = require('./storageManager');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var proposalTypeMap = {};

var CustomApi = function () {
  function CustomApi() {
    var websocketMock = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    var _this = this;

    var onClose = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var connection = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

    _classCallCheck(this, CustomApi);

    var option = {};
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
    if (connection) {
      option.connection = connection;
    }
    var requestHandlers = {
      tick: function tick() {
        return 0;
      },
      error: function error() {
        return 0;
      },
      ohlc: function ohlc() {
        return 0;
      },
      candles: function candles() {
        return 0;
      },
      forget_all: function forget_all() {
        return 0;
      },
      history: function history(symbol, args) {
        return _this.originalApi.getTickHistory(symbol, args);
      },
      proposal_open_contract: function proposal_open_contract(contractId) {
        return _this.originalApi.subscribeToOpenContract(contractId);
      },
      proposal: function proposal() {
        var _originalApi;

        return (_originalApi = _this.originalApi).subscribeToPriceForContractProposal.apply(_originalApi, arguments);
      },
      buy: function buy() {
        var _originalApi2;

        return (_originalApi2 = _this.originalApi).buyContract.apply(_originalApi2, arguments);
      },
      authorize: function authorize() {
        var _originalApi3;

        return (_originalApi3 = _this.originalApi).authorize.apply(_originalApi3, arguments);
      },
      balance: function balance() {
        var _originalApi4;

        return (_originalApi4 = _this.originalApi).subscribeToBalance.apply(_originalApi4, arguments);
      }
    };
    if (onClose) {
      _binaryLiveApi.LiveApi.prototype.onClose = onClose;
    }
    this.responseHandlers = {
      history: function history(response) {
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
      tick: function tick(response) {
        var tick = response.tick;
        _observer.observer.emit('api.tick', {
          epoch: +tick.epoch,
          quote: +tick.quote
        });
      },
      candles: function candles(response) {
        var candlesList = [];
        var candles = response.candles;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = candles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var o = _step.value;

            candlesList.push({
              open: +o.open,
              high: +o.high,
              low: +o.low,
              close: +o.close,
              epoch: +o.epoch
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
      ohlc: function ohlc(response) {
        var ohlc = response.ohlc;
        _observer.observer.emit('api.ohlc', {
          open: +ohlc.open,
          high: +ohlc.high,
          low: +ohlc.low,
          close: +ohlc.close,
          epoch: +ohlc.open_time
        });
      },
      authorize: function authorize(response) {
        _observer.observer.emit('api.authorize', response.authorize);
      },
      error: function error(response) {
        _observer.observer.emit('api.error', response);
      },
      _default: function _default(response, type) {
        _observer.observer.emit('api.log', response);
        response[type].echo_req = response.echo_req;
        _observer.observer.emit('api.' + type, response[type]);
      }
    };
    option.sendSpy = function (e) {
      var reqData = JSON.parse(e);
      if (reqData.proposal) {
        proposalTypeMap[reqData.req_id] = reqData.contract_type;
      } else if (reqData.forget_all && reqData.forget_all === 'proposal') {
        proposalTypeMap = {};
      }
    };
    this.originalApi = new _binaryLiveApi.LiveApi(option);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      var _loop = function _loop() {
        var type = _step2.value;

        var responseHander = !_this.responseHandlers[type] ? _this.responseHandlers._default : _this.responseHandlers[type]; // eslint-disable-line no-underscore-dangle
        _this.originalApi.events.on(type, function (data) {
          // eslint-disable-line no-loop-func
          if (_this.destroyed) {
            return;
          }
          if ('error' in data) {
            _this.responseHandlers.error(data);
          } else {
            if ('proposal' in data) {
              data.proposal.contract_type = proposalTypeMap[data.req_id];
            }
            responseHander(data, type);
          }
        });
        _this[type] = function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this.handlePromiseForCalls(type, args, requestHandlers);
        };
      };

      for (var _iterator2 = Object.keys(requestHandlers)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  _createClass(CustomApi, [{
    key: 'handlePromiseForCalls',
    value: function handlePromiseForCalls(type, args, requestHandlers) {
      var _this2 = this;

      var promise = requestHandlers[type].apply(requestHandlers, _toConsumableArray(args));
      if (promise instanceof Promise) {
        promise.then(function () {}, function (err) {
          if (type === 'buy') {
            _this2.responseHandlers.error(err);
          }
        });
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.originalApi.socket.close();
      this.destroyed = true;
    }
  }]);

  return CustomApi;
}();

exports.default = CustomApi;