var CustomApi = require('./CustomApi');
var storageManager = require('./storageManager');

module.exports = {
	addTokenIfValid: function addTokenIfValid(token, callback) {
		var LiveApi = require('binary-live-api')
			.LiveApi;
		var api = new LiveApi();
		api.authorize(token)
			.then(function (response) {
				api.disconnect();
				storageManager.addToken(token, response.authorize.loginid, response.authorize.is_virtual);
				if (callback) {
					callback(null);
				}
			}, function (reason) {
				api.disconnect();
				removeToken(token);
				if (callback) {
					callback('Error');
				}
			});
	}
};
