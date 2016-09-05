'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _binaryLiveApi = require('binary-live-api');

var _observer = require('./observer');

var _storageManager = require('./storageManager');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CustomApi = function () {
  function CustomApi() {
    var _this = this;

    var websocketMock = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];
    var onClose = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    _classCallCheck(this, CustomApi);

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
      history: function history(symbol, args) {
        return _this.originalApi.getTickHistory(symbol, args);
      },
      proposal_open_contract: function proposal_open_contract(contractId) {
        return (// eslint-disable-line camelcase
          _this.originalApi.send({
            proposal_open_contract: 1,
            contract_id: contractId,
            subscribe: 1
          })
        );
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
    var originalSendRaw = _binaryLiveApi.LiveApi.prototype.sendRaw;
    var that = this;
    _binaryLiveApi.LiveApi.prototype.sendRaw = function sendRaw(json) {
      if ('proposal' in json) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(that.proposalMap)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            if (that.proposalMap[key] === json.contract_type) {
              delete that.proposalMap[key];
            }
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

        that.proposalMap[json.req_id] = json.contract_type;
      }
      originalSendRaw.call(this, json);
    };
    this.events = {
      ohlc: function ohlc(response, type) {
        if (!_this.apiFailed(response, type)) {
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
        if (!_this.apiFailed(response, type)) {
          var candlesList = [];
          var candles = response.candles;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = candles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var o = _step2.value;

              candlesList.push({
                open: +o.open,
                high: +o.high,
                low: +o.low,
                close: +o.close,
                epoch: +o.epoch
              });
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

          _observer.observer.emit('api.candles', candlesList);
        }
      },
      tick: function tick(response, type) {
        if (!_this.apiFailed(response, type)) {
          var tick = response.tick;
          _observer.observer.emit('api.tick', {
            epoch: +tick.epoch,
            quote: +tick.quote
          });
        }
      },
      history: function history(response, type) {
        if (!_this.apiFailed(response, type)) {
          (function () {
            var ticks = [];
            var history = response.history;
            history.times.forEach(function (time, index) {
              ticks.push({
                epoch: +time,
                quote: +history.prices[index]
              });
            });
            _observer.observer.emit('api.history', ticks);
          })();
        }
      },
      authorize: function authorize(response, type) {
        if (!_this.apiFailed(response, type)) {
          _observer.observer.emit('api.authorize', response.authorize);
        }
      },
      error: function error(response, type) {
        if (!_this.apiFailed(response, type)) {
          response.error.type = type;
          _observer.observer.emit('api.error', response);
          _observer.observer.emit('api.' + type, response[type]);
        }
      },
      _default: function _default(response, type) {
        if (!_this.apiFailed(response, type)) {
          _observer.observer.emit('api.log', response);
          _observer.observer.emit('api.' + type, response[type]);
        }
      }
    };
    this.originalApi = new _binaryLiveApi.LiveApi(option);
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      var _loop = function _loop() {
        var e = _step3.value;

        var event = !_this.events[e] ? _this.events._default : _this.events[e]; // eslint-disable-line no-underscore-dangle
        _this.originalApi.events.on(e, function (data) {
          if (_this.destroyed) {
            return;
          }
          if (data.msg_type === 'proposal') {
            data.proposal.contract_type = _this.proposalMap[data.req_id];
          }
          event(data, e);
        });
        _this[e] = function () {
          var promise = events[e].apply(events, arguments);
          if (promise instanceof Promise) {
            promise.then(function () {
              return 0;
            }, function () {
              return 0;
            });
          }
        };
      };

      for (var _iterator3 = Object.keys(events)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }
  }

  _createClass(CustomApi, [{
    key: 'apiFailed',
    value: function apiFailed(response, type) {
      if (response.error) {
        response.error.type = type;
        _observer.observer.emit('api.error', response.error);
        return true;
      }
      return false;
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