export const getTokenList = () => {
  localStorage.tokenList = !('tokenList' in localStorage) ? '[]'
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

const findAccount = (accountName = '') => getTokenList()
  .findIndex((tokenInfo) => tokenInfo.account_name === accountName);

export const findToken = (token = '') => getTokenList()
  .findIndex((tokenInfo) => tokenInfo.token === token);

export const addToken = (token = '', accountName = '', isVirtual = false, hasRealityCheck = false, hasTradeLimitation = false) => {
  const tokenList = getTokenList();
  const tokenIndex = findToken(token);
  const accountIndex = findAccount(accountName);
  if (tokenIndex < 0 && accountIndex < 0) {
    tokenList.push({
      account_name: accountName,
      token,
      isVirtual,
      hasRealityCheck,
      hasTradeLimitation,
    });
    setTokenList(tokenList);
  }
};

export const getToken = (token) => {
  const tokenList = getTokenList();
  const index = findToken(token);
  return (index >= 0) ? tokenList[index] : {};
};

export const removeToken = (token) => {
  const index = findToken(token);
  if (index > -1) {
    const tokenList = getTokenList();
    tokenList.splice(index, 1);
    localStorage.tokenList = tokenList;
  }
};

export const removeAllTokens = () => {
  delete localStorage.tokenList;
};

export const isDone = (varName) => varName in localStorage;

export const setDone = (varName) => {
  localStorage[varName] = true;
};

export const set = (varName, value) => {
  localStorage[varName] = value;
};

export const get = (varName) => localStorage[varName];
