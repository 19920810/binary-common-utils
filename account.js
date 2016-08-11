'use strict';
var LiveApi = require('binary-live-api').LiveApi;
var storageManager = require('./storageManager');

module.exports = {
	addTokenIfValid: function addTokenIfValid(token, callback) {
		var api;
		if ( typeof WebSocket === 'undefined' ) {
			api = new LiveApi({websocket: require('ws')});
		} else {
			api = new LiveApi();
		}
		api.authorize(token)
			.then(function (response) {
				api.disconnect();
				storageManager.addToken(token, response.authorize.loginid, response.authorize.is_virtual);
				if (callback) {
					callback(null);
				}
			}, function (reason) {
				api.disconnect();
				storageManager.removeToken(token);
				if (callback) {
					callback('Error');
				}
			});
	},
	logoutAllTokens: function logoutAllTokens(callback) {
		var api;
		if ( typeof WebSocket === 'undefined' ) {
			api = new LiveApi({websocket: require('ws')});
		} else {
			api = new LiveApi();
		}
		var tokenList = storageManager.getTokenList();
		if ( tokenList.length === 0 ) {
			storageManager.removeAllTokens();
			if ( callback ) {
				callback();
			}
			return;
		}
		var token = tokenList[0].token;
		var logout = function logout(){
			storageManager.removeAllTokens();
			api.disconnect();
			if ( callback ) {
				callback();
			}
		};
		api.authorize(token)
			.then(function (response) {
				api.logOut().then(logout, logout);
			}, logout);
	}
};
