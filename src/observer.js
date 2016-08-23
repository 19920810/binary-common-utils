'use strict';
class Observer {
	constructor() {
		this._eventActionMap = {};
	}
	register(_event, once, unregisterIfError, unregisterAllBefore) {
		if ( unregisterAllBefore ) {
			this.unregisterAll(_event);
		}
		let apiError = (error) => {
			if ( error.type === unregisterIfError.type ) {
				this.unregister('api.error', apiError);
				unregisterIfError.unregister.forEach((unregister) => {
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
		return new Promise((resolve, reject) => {
			if ( once ) {
				this.unregister(_event, resolve);
			}
			if ( unregisterIfError ) {
				this.unregister('api.error', apiError);
			}
			let actionList = this._eventActionMap[_event];
			if ( actionList ) {
				actionList.push(resolve);
			} else {
				this._eventActionMap[_event] = [resolve];
			}
		});
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
		if (this._eventActionMap.hasOwnProperty(_event)){
			this._eventActionMap[_event].forEach((action) => {
				action(data);
			});
		}
	}
}

export const observer = new Observer();
