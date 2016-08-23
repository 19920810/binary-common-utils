'use strict';

export const getTokenList = () => {
	localStorage.tokenList = (!localStorage.hasOwnProperty('tokenList')) ? '[]'
		: localStorage.tokenList;
	try {
		return JSON.parse(localStorage.tokenList);
	} catch (e) {
		localStorage.tokenList = '[]';
		return [];
	}
};

export const setTokenList = (tokenList = []) => {
	localStorage.tokenList = JSON.stringify(tokenList);
};

const findAccount = (account_name = '') => {
	return getTokenList().findIndex((tokenInfo) => {
		return tokenInfo.account_name === account_name;
	});
};

export const findToken = (token = '') => {
	return getTokenList().findIndex((tokenInfo) => {
		return tokenInfo.token === token;
	});
};

export const addToken = (token = '', account_name = '', isVirtual = '') => {
	let tokenList = getTokenList();
	let tokenIndex = findToken(token);
	let accountIndex = findAccount(account_name);
	if (tokenIndex < 0 && accountIndex < 0) {
		tokenList.push({
			account_name: account_name,
			token: token,
			isVirtual: isVirtual
		});
		setTokenList(tokenList);
	}
};

export const getToken = (token) => {
	let tokenList = getTokenList();
	let index = findToken(token);
	return ( index >= 0 ) ? tokenList[index] : {};
};

export const removeToken = (token) => {
	let index = findToken(token);
	if ( index > -1) {
		let tokenList = getTokenList();
		tokenList.splice(index, 1);
		localStorage.tokenList = tokenList;
	}
};

export const removeAllTokens = () => {
	delete localStorage.tokenList;
};

export const isDone = (varName) => {
	return localStorage.hasOwnProperty(varName);
};

export const setDone = (varName) => {
	localStorage[varName] = true;
};

export const set = (varName, value) => {
	localStorage[varName] = value;
};

export const get = (varName) => {
	return localStorage[varName];
};
