'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.logoutAllTokens = exports.addTokenIfValid = undefined;

var _binaryLiveApi = require('binary-live-api');

var _storageManager = require('./storageManager');

var _ws = require('ws');

var _ws2 = _interopRequireDefault(_ws);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addTokenIfValid = exports.addTokenIfValid = function addTokenIfValid(token) {
	var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

	var option = typeof WebSocket === 'undefined' ? { websocket: _ws2.default } : {},
	    api = new _binaryLiveApi.LiveApi(option);
	api.authorize(token).then(function (response) {
		api.disconnect();
		(0, _storageManager.addToken)(token, response.authorize.loginid, response.authorize.is_virtual);
		callback(null);
	}, function (reason) {
		api.disconnect();
		(0, _storageManager.removeToken)(token);
		callback('Error');
	});
};

var logoutAllTokens = exports.logoutAllTokens = function logoutAllTokens(callback) {
	var option = typeof WebSocket === 'undefined' ? { websocket: _ws2.default } : {},
	    api = new _binaryLiveApi.LiveApi(option),
	    tokenList = (0, _storageManager.getTokenList)();
	var logout = function logout() {
		(0, _storageManager.removeAllTokens)();
		api.disconnect();
		callback();
	};
	if (tokenList.length === 0) {
		logout();
	} else {
		api.authorize(tokenList[0].token).then(function () {
			api.logOut().then(logout, logout);
		}, logout);
	}
};