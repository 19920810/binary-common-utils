'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
    value: function unregister(event, _function) {
      if (!_function) {
        return;
      }
      var actionList = this.eventActionMap[event];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(actionList)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var i = _step.value;

          if (actionList[i].searchBy === _function) {
            actionList.splice(i, 1);
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
      delete this.eventActionMap[event];
    }
  }, {
    key: 'emit',
    value: function emit(event, data) {
      var _this3 = this;

      if (event in this.eventActionMap) {
        this.eventActionMap[event].forEach(function (action, i) {
          delete _this3.eventActionMap[event][i];
          action({
            data: data,
            next: _this3.makePromiseForEvent(event)
          });
        });
      }
    }
  }]);

  return Observer;
}();

var observer = exports.observer = new Observer();
// eslint-disable-line