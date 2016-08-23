'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var getTokenList = exports.getTokenList = function getTokenList() {
	localStorage.tokenList = !localStorage.hasOwnProperty('tokenList') ? '[]' : localStorage.tokenList;
	try {
		return JSON.parse(localStorage.tokenList);
	} catch (e) {
		localStorage.tokenList = '[]';
		return [];
	}
};

var setTokenList = exports.setTokenList = function setTokenList() {
	var tokenList = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

	localStorage.tokenList = JSON.stringify(tokenList);
};

var findAccount = function findAccount() {
	var account_name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

	return getTokenList().findIndex(function (tokenInfo) {
		return tokenInfo.account_name === account_name;
	});
};

var findToken = exports.findToken = function findToken() {
	var token = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

	return getTokenList().findIndex(function (tokenInfo) {
		return tokenInfo.token === token;
	});
};

var addToken = exports.addToken = function addToken() {
	var token = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
	var account_name = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
	var isVirtual = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

	var tokenList = getTokenList();
	var tokenIndex = findToken(token);
	var accountIndex = findAccount(account_name);
	if (tokenIndex < 0 && accountIndex < 0) {
		tokenList.push({
			account_name: account_name,
			token: token,
			isVirtual: isVirtual
		});
		setTokenList(tokenList);
	}
};

var getToken = exports.getToken = function getToken(token) {
	var tokenList = getTokenList();
	var index = findToken(token);
	return index >= 0 ? tokenList[index] : {};
};

var removeToken = exports.removeToken = function removeToken(token) {
	var index = findToken(token);
	if (index > -1) {
		var tokenList = getTokenList();
		tokenList.splice(index, 1);
		localStorage.tokenList = tokenList;
	}
};

var removeAllTokens = exports.removeAllTokens = function removeAllTokens() {
	delete localStorage.tokenList;
};

var isDone = exports.isDone = function isDone(varName) {
	return localStorage.hasOwnProperty(varName);
};

var setDone = exports.setDone = function setDone(varName) {
	localStorage[varName] = true;
};

var set = exports.set = function set(varName, value) {
	localStorage[varName] = value;
};

var get = exports.get = function get(varName) {
	return localStorage[varName];
};