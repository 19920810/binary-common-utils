'use strict';
class Observer {
	constructor() {
		this._eventActionMap = {};
	}
	register(_event, _action, once, unregisterIfError, unregisterAllBefore) {
		if ( unregisterAllBefore ) {
			this.unregisterAll(_event);
		}
		let apiError = (error) => {
			if ( error.type === unregisterIfError.type ) {
				this.unregister('api.error', apiError);
				unregisterIfError.unregister.forEach(function(unregister){
					if ( unregister instanceof Array ) {
						this.unregister(...unregister);
					} else {
						this.unregisterAll(unregister);
					}
				});
			}
		};
		if ( unregisterIfError ) {
			this.register('api.error', apiError);
		}
		let action = (...args) => {
			if ( once ) {
				this.unregister(_event, _action);
			}
			if ( unregisterIfError ) {
				this.unregister('api.error', apiError);
			}
			_action(...args);
		};
		let actionList = this._eventActionMap[_event];
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
	unregister(_event, _function) {
		let actionList = this._eventActionMap[_event];
		for ( let i in actionList ) {
			if ( actionList[i].searchBy === _function ) {
				actionList.splice(i, 1);
			}
		}
	}
	isRegistered(_event) {
		return this._eventActionMap.hasOwnProperty(_event);
	}
	unregisterAll(_event) {
		delete this._eventActionMap[_event];
	}
	emit(_event, data) {
		return new Promise((resolve, reject) => {
			if (this._eventActionMap.hasOwnProperty(_event)){
				this._eventActionMap[_event].forEach((action) => {
					action.action(data);
				});
				resolve();
			}
		});
	}
}

export const observer = new Observer();
