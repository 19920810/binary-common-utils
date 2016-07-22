'use strict';
var CustomApi = require('./customApi');
var storageManager = require('./storageManager');

module.exports = {
	addTokenIfValid: function addTokenIfValid(token, callback) {
		var api = new CustomApi()._originalApi;
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
		var api = new CustomApi()._originalApi;
		var tokenList = storageManager.getTokenList();
		var token = tokenList[0].token;
		api.authorize(token)
			.then(function (response) {
				storageManager.removeAllTokens();
				api.logOut().then(function(){
					api.disconnect();
					if ( callback ) {
						callback();
					}
				});
			});
	}
};
