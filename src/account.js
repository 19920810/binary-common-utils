import { LiveApi } from 'binary-live-api';
import { addToken, removeToken, getTokenList, removeAllTokens } from './storageManager';

export const addTokenIfValid = (token, callback = () => {
  }) => {
  let option = (typeof WebSocket === 'undefined') ? {
    websocket: require('ws'), // eslint-disable-line global-require, import/no-extraneous-dependencies
  } : {}; // eslint-disable-line import/newline-after-import
  let api = new LiveApi(option);
  api.authorize(token)
    .then((response) => {
      api.disconnect();
      addToken(token, response.authorize.loginid, response.authorize.is_virtual);
      callback(null);
    }, () => {
      api.disconnect();
      removeToken(token);
      callback('Error');
    });
};

export const logoutAllTokens = (callback) => {
  let option = (typeof WebSocket === 'undefined') ? {
      websocket: require('ws'), // eslint-disable-line global-require, import/no-extraneous-dependencies
    } : {}; // eslint-disable-line import/newline-after-import
  let api = new LiveApi(option);
  let tokenList = getTokenList();
  let logout = () => {
    removeAllTokens();
    api.disconnect();
    callback();
  };
  if (tokenList.length === 0) {
    logout();
  } else {
    api.authorize(tokenList[0].token)
      .then(() => {
        api.logOut().then(logout, logout);
      }, logout);
  }
};
