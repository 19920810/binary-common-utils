'use strict';
import {LiveApi} from 'binary-live-api';
import {addToken, removeToken, getTokenList, removeAllTokens} from './storageManager';

export const addTokenIfValid = (token, callback = () => {}) => {
	let option = ( typeof WebSocket === 'undefined' ) ? {websocket: require('ws')} : {},
		api = new LiveApi(option);
	api.authorize(token)
		.then((response) => {
			api.disconnect();
			addToken(token, response.authorize.loginid, response.authorize.is_virtual);
			callback(null);
		}, (reason) => {
			api.disconnect();
			removeToken(token);
			callback('Error');
		});
};

export const logoutAllTokens = (callback) => {
	let option = ( typeof WebSocket === 'undefined' ) ? {websocket: require('ws')} : {},
		api = new LiveApi(option),
		tokenList = getTokenList();
	let logout = () => {
		removeAllTokens();
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
