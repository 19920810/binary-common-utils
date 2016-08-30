'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Observer = function () {
  function Observer() {
    _classCallCheck(this, Observer);

    this.eventActionMap = {};
  }

  _createClass(Observer, [{
    key: 'register',
    value: function register(event, unregisterIfError, unregisterAllBefore) {
      var _this = this;

      if (unregisterAllBefore) {
        this.unregisterAll(event);
      }
      var _apiError = null;
      if (unregisterIfError) {
        _apiError = function apiError(error) {
          if (error.type === unregisterIfError.type) {
            _this.unregister('api.error', _apiError);
            unregisterIfError.unregister.forEach(function (unregister) {
              if (unregister instanceof Array) {
                _this.unregister.apply(_this, _toConsumableArray(unregister));
              } else {
                _this.unregisterAll(unregister);
              }
            });
          }
        };
        this.register('api.error', _apiError);
      }
      return this.makePromiseForEvent(event, _apiError);
    }
  }, {
    key: 'makePromiseForEvent',
    value: function makePromiseForEvent(event, apiError) {
      var _this2 = this;

      return new Promise(function (resolve) {
        _this2.unregister('api.error', apiError);
        var actionList = _this2.eventActionMap[event];
        if (actionList) {
          actionList.push(resolve);
        } else {
          _this2.eventActionMap[event] = [resolve];
        }
      });
    }
  }, {
    key: 'unregister',
    value: function unregister(event, func) {
      if (!func) {
        return;
      }
      var actionList = this.eventActionMap[event];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(actionList)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var i = _step.value;

          if (actionList[i] === func) {
            func({});
            actionList.splice(i, 1);
            return;
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
    }
  }, {
    key: 'isRegistered',
    value: function isRegistered(event) {
      return event in this.eventActionMap;
    }
  }, {
    key: 'unregisterAll',
    value: function unregisterAll(event) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.eventActionMap[event][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var action = _step2.value;

          action({});
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

      delete this.eventActionMap[event];
    }
  }, {
    key: 'keepAlive',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(promise, funcCall) {
        var res;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return promise;

              case 2:
                res = _context.sent;

                if (res.next) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt('return');

              case 5:
                funcCall(res.data);
                _context.next = 8;
                return this.keepAlive(res.next, funcCall);

              case 8:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function keepAlive(_x, _x2) {
        return _ref.apply(this, arguments);
      }

      return keepAlive;
    }()
  }, {
    key: 'emit',
    value: function emit(event, data) {
      if (event in this.eventActionMap) {
        var tmp = this.eventActionMap[event];
        this.eventActionMap[event] = [];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = tmp[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var action = _step3.value;

            action({
              data: data,
              next: this.makePromiseForEvent(event)
            });
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
    }
  }]);

  return Observer;
}();

exports.default = Observer;
var observer = exports.observer = new Observer();