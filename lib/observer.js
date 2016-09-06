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
    value: function register(event, _action, once, unregisterIfError, unregisterAllBefore) {
      var _this = this;

      if (unregisterAllBefore) {
        this.unregisterAll(event);
      }
      var apiError = function apiError(error) {
        if (error.type === unregisterIfError.type) {
          _this.unregister('api.error', apiError);
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = unregisterIfError.unregister[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var unreg = _step.value;

              if (unreg instanceof Array) {
                _this.unregister.apply(_this, _toConsumableArray(unreg));
              } else {
                _this.unregisterAll(unreg);
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
      };
      if (unregisterIfError) {
        this.register('api.error', apiError);
      }
      var action = function action() {
        if (once) {
          _this.unregister(event, _action);
        }
        if (unregisterIfError) {
          _this.unregister('api.error', apiError);
        }
        _action.apply(undefined, arguments);
      };
      var actionList = this.eventActionMap[event];
      if (actionList) {
        actionList.push({
          action: action,
          searchBy: _action
        });
      } else {
        this.eventActionMap[event] = [{
          action: action,
          searchBy: _action
        }];
      }
    }
  }, {
    key: 'unregister',
    value: function unregister(event, _function) {
      var actionList = this.eventActionMap[event];
      var i = actionList.findIndex(function (r) {
        return r.searchBy === _function;
      });
      if (i >= 0) {
        actionList.splice(i, 1);
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
      if (event in this.eventActionMap) {
        var actions = [].concat(_toConsumableArray(this.eventActionMap[event]));
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = actions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var action = _step2.value;

            action.action(data);
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
    }
  }]);

  return Observer;
}();

exports.default = Observer;
var observer = exports.observer = new Observer();