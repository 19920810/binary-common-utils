import { LiveApi } from 'binary-live-api';
import { addToken, removeToken, getTokenList, removeAllTokens } from './storageManager';

export const addTokenIfValid = (token, callback = () => {
  }) => {
  const option = (typeof WebSocket === 'undefined') ? {
    websocket: require('ws'), // eslint-disable-line global-require, import/no-extraneous-dependencies
  } : {}; // eslint-disable-line import/newline-after-import
  const api = new LiveApi(option);
  api.authorize(token)
    .then((response) => {
      api.getLandingCompanyDetails(response.authorize.landing_company_name).then(r => {
        addToken(token, response.authorize.loginid,
          response.authorize.is_virtual, r.landing_company_details.has_reality_check);
        api.disconnect();
        callback(null);
      }, () => 0);
    }, () => {
      removeToken(token);
      api.disconnect();
      callback('Error');
    });
};

export const logoutAllTokens = (callback) => {
  const option = (typeof WebSocket === 'undefined') ? {
      websocket: require('ws'), // eslint-disable-line global-require, import/no-extraneous-dependencies
    } : {}; // eslint-disable-line import/newline-after-import
  const api = new LiveApi(option);
  const tokenList = getTokenList();
  const logout = () => {
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
