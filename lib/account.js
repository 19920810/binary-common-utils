'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.logoutAllTokens = exports.addTokenIfValid = undefined;

var _binaryLiveApi = require('binary-live-api');

var _storageManager = require('./storageManager');

var addTokenIfValid = exports.addTokenIfValid = function addTokenIfValid(token) {
  var callback = arguments.length <= 1 || arguments[1] === undefined ? function () {} : arguments[1];

  var option = typeof WebSocket === 'undefined' ? {
    websocket: require('ws') } : {}; // eslint-disable-line import/newline-after-import
  var api = new _binaryLiveApi.LiveApi(option);
  api.authorize(token).then(function (response) {
    api.getLandingCompanyDetails(response.authorize.landing_company_name).then(function (r) {
      (0, _storageManager.addToken)(token, response.authorize.loginid, response.authorize.is_virtual, r.landing_company_details.has_reality_check);
      api.disconnect();
      callback(null);
    }, function () {
      return 0;
    });
  }, function () {
    (0, _storageManager.removeToken)(token);
    api.disconnect();
    callback('Error');
  });
};

var logoutAllTokens = exports.logoutAllTokens = function logoutAllTokens(callback) {
  var option = typeof WebSocket === 'undefined' ? {
    websocket: require('ws') } : {}; // eslint-disable-line import/newline-after-import
  var api = new _binaryLiveApi.LiveApi(option);
  var tokenList = (0, _storageManager.getTokenList)();
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