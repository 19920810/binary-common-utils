'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _binaryLiveApi = require('binary-live-api');

var _observer = require('./observer');

var _storageManager = require('./storageManager');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CustomApi = function (_LiveApi) {
  _inherits(CustomApi, _LiveApi);

  function CustomApi(websocketMock, onClose) {
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

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CustomApi).call(this));

    if (onClose) {
      _set(Object.getPrototypeOf(CustomApi.prototype), 'onClose', onClose, _this);
    }
    var sendRawBackup = _binaryLiveApi.LiveApi.prototype.sendRaw;
    _set(Object.getPrototypeOf(CustomApi.prototype), 'sendRaw', function (json) {
      if ('proposal' in json) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.keys(_this.proposalMap)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            if (_this.proposalMap[key] === json.contract_type) {
              delete _this.proposalMap[key];
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

        _this.proposalMap[json.req_id] = json.contract_type;
      }
      sendRawBackup.call(_this, json);
    }, _this);
    _this.proposalMap = {};
    _this.transformers = {
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
      candles: function candles(response) {
        var candlesList = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = response.candles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var ohlc = _step2.value;

            candlesList.push({
              open: +ohlc.open,
              high: +ohlc.high,
              low: +ohlc.low,
              close: +ohlc.close,
              epoch: +ohlc.epoch
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
      },
      tick: function tick(response) {
        var tick = response.tick;
        _observer.observer.emit('api.tick', {
          epoch: +tick.epoch,
          quote: +tick.quote
        });
      },
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
      error: function error(response, type) {
        response.error.type = type;
        _observer.observer.emit('api.error', response.error);
      },
      default: function _default(response, type) {
        _observer.observer.emit('api.' + type, response[type]);
      }
    };
    var _arr = ['error', 'tick', 'ohlc', 'candles', 'history', 'proposal_open_contract', 'proposal', 'buy', 'authorize', 'balance'];

    var _loop = function _loop() {
      var e = _arr[_i];
      var tEvent = !_this.transformers[e] ? _this.transformers.default : _this.transformers[e];
      _this.events.on(e, function (data) {
        if (_this.destroyed) {
          return;
        }
        if (data.msg_type === 'proposal') {
          data.proposal.contract_type = _this.proposalMap[data.req_id];
        }
        tEvent(data, e);
      });
    };

    for (var _i = 0; _i < _arr.length; _i++) {
      _loop();
    }
    return _this;
  }

  _createClass(CustomApi, [{
    key: 'history',
    value: function history() {
      return this.getTickHistory.apply(this, arguments);
    }
  }, {
    key: 'proposal_open_contract',
    value: function proposal_open_contract(contractId) {
      return this.send({
        proposal_open_contract: 1,
        contract_id: contractId,
        subscribe: 1
      });
    }
  }, {
    key: 'proposal',
    value: function proposal() {
      return this.subscribeToPriceForContractProposal.apply(this, arguments);
    }
  }, {
    key: 'buy',
    value: function buy() {
      return this.buyContract.apply(this, arguments);
    }
  }, {
    key: 'authorize',
    value: function authorize() {
      var _get2;

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return (_get2 = _get(Object.getPrototypeOf(CustomApi.prototype), 'authorize', this)).call.apply(_get2, [this].concat(args));
    }
  }, {
    key: 'balance',
    value: function balance() {
      return this.subscribeToBalance.apply(this, arguments);
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.destroyed = true;
    }
  }]);

  return CustomApi;
}(_binaryLiveApi.LiveApi);

exports.default = CustomApi;