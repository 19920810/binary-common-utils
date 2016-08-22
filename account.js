'use strict';
import {LiveApi} from 'binary-live-api';
import storageManager from './storageManager';

export const addTokenIfValid = (token, callback = () => {}) => {
	let option = ( typeof WebSocket === 'undefined' ) ? {websocket: require('ws')} : {},
		api = new LiveApi(option);
	api.authorize(token)
		.then((response) => {
			api.disconnect();
			storageManager.addToken(token, response.authorize.loginid, response.authorize.is_virtual);
			callback(null);
		}, (reason) => {
			api.disconnect();
			storageManager.removeToken(token);
			callback('Error');
		});
};

export const logoutAllTokens = (callback) => {
	let option = ( typeof WebSocket === 'undefined' ) ? {websocket: require('ws')} : {},
		api = new LiveApi(option),
		tokenList = storageManager.getTokenList();
	let logout = () => {
		storageManager.removeAllTokens();
		api.disconnect();
		callback();
	};
	if ( tokenList.length === 0 ) {
		logout();
	} else {
		api.authorize(tokenList[0].token)
			.then(() => { api.logOut().then(logout, logout); }, logout);
	}
};
