'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getTokenList = exports.getTokenList = function getTokenList() {
  localStorage.tokenList = !('tokenList' in localStorage) ? '[]' : localStorage.tokenList;
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
  var accountName = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
  return getTokenList().findIndex(function (tokenInfo) {
    return tokenInfo.account_name === accountName;
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
  var accountName = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
  var isVirtual = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
  var hasRealityCheck = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  var tokenList = getTokenList();
  var tokenIndex = findToken(token);
  var accountIndex = findAccount(accountName);
  if (tokenIndex < 0 && accountIndex < 0) {
    tokenList.push({
      account_name: accountName,
      token: token,
      isVirtual: isVirtual,
      hasRealityCheck: hasRealityCheck
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
  return varName in localStorage;
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