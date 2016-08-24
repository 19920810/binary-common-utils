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

		this._eventActionMap = {};
	}

	_createClass(Observer, [{
		key: 'register',
		value: function register(_event, once, unregisterIfError, unregisterAllBefore) {
			var _this = this;

			if (unregisterAllBefore) {
				this.unregisterAll(_event);
			}
			var apiError = function apiError(error) {
				if (error.type === unregisterIfError.type) {
					_this.unregister('api.error', apiError);
					unregisterIfError.unregister.forEach(function (unregister) {
						if (unregister instanceof Array) {
							_this.unregister.apply(_this, _toConsumableArray(unregister));
						} else {
							_this.unregisterAll(unregister);
						}
					});
				}
			};
			if (unregisterIfError) {
				this.register('api.error', apiError);
			}
			return new Promise(function (resolve, reject) {
				if (once) {
					_this.unregister(_event, resolve);
				}
				if (unregisterIfError) {
					_this.unregister('api.error', apiError);
				}
				var actionList = _this._eventActionMap[_event];
				if (actionList) {
					actionList.push(resolve);
				} else {
					_this._eventActionMap[_event] = [resolve];
				}
			});
		}
	}, {
		key: 'unregister',
		value: function unregister(_event, _function) {
			var actionList = this._eventActionMap[_event];
			for (var i in actionList) {
				if (actionList[i].searchBy === _function) {
					actionList.splice(i, 1);
				}
			}
		}
	}, {
		key: 'isRegistered',
		value: function isRegistered(_event) {
			return this._eventActionMap.hasOwnProperty(_event);
		}
	}, {
		key: 'unregisterAll',
		value: function unregisterAll(_event) {
			delete this._eventActionMap[_event];
		}
	}, {
		key: 'emit',
		value: function emit(_event, data) {
			if (this._eventActionMap.hasOwnProperty(_event)) {
				this._eventActionMap[_event].forEach(function (action) {
					action(data);
				});
			}
		}
	}]);

	return Observer;
}();

var observer = exports.observer = new Observer();