'use strict';
var Observer = function Observer(){
	if ( Observer.instance ){
		return Observer.instance;
	}
	Observer.instance = this;
	this._eventActionMap = {};
};
Observer.prototype = Object.create(null, {
	register: {
		value: function register(_event, _action, once, unregisterIfError, unregisterAllBefore){
			var that = this;
			if ( unregisterAllBefore ) {
				this.unregisterAll(_event);
			}
			var apiError = function apiError(error){
				if ( error.type === unregisterIfError.type ) {
					that.unregister('api.error', apiError);
					unregisterIfError.unregister.forEach(function(unregister){
						if ( unregister instanceof Array ) {
							that.unregister.apply(that, unregister);
						} else {
							that.unregisterAll(unregister);
						}
					});
				}
			};
			if ( unregisterIfError ) {
				this.register('api.error', apiError);
			}
			var action = function action() {
				if ( once ) {
					that.unregister(_event, _action);
				}
				if ( unregisterIfError ) {
					that.unregister('api.error', apiError);
				}
				_action.apply(null, Array.prototype.slice.call(arguments));
			};
			var actionList = this._eventActionMap[_event];
			if ( actionList ) {
				actionList.push({
					action: action,
					searchBy: _action
				});
			} else {
				this._eventActionMap[_event] = [{
					action: action,
					searchBy: _action
				}];
			}
		}
	},
	unregister: {
		value: function unregister(_event, _function) {
			var actionList = this._eventActionMap[_event];
			var toDeleteIndexes = [];
			var i;
			if ( actionList ) {
				for ( i in actionList ) {
					if ( actionList[i].searchBy === _function ) {
						toDeleteIndexes.push(i);
					}
				}
				for ( i in toDeleteIndexes) {
					delete actionList[toDeleteIndexes[i]];
				}
			}
		}
	},
	isRegistered: {
		value: function isRegistered(_event){
			return this._eventActionMap.hasOwnProperty(_event);
		}
	},
	unregisterAll: {
		value: function unregister(_event) {
			delete this._eventActionMap[_event];
		}
	},
	emit: {
		value: function emit(_event, data) {
			var that = this;
			return new Promise(function(resolve, reject) {
				if (that._eventActionMap.hasOwnProperty(_event)){
					var actionList = that._eventActionMap[_event];
					for ( var index in actionList ) {
						actionList[index].action(data);
					}
					resolve();
				}
			});
		}
	},
	_destroy: {
		value: function _destroy(){
			this._eventActionMap = {};
			delete Observer.instance;
		}
	}
});
module.exports = Observer;
