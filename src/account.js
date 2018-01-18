import { LiveApi } from 'binary-live-api';
import {
  addToken, removeToken, getTokenList, removeAllTokens,
  get as getStorage,
} from './storageManager';


const options = {
  apiUrl: getStorage('endpoint'),
  websocket: typeof WebSocket === 'undefined' ? require('ws') : undefined, // eslint-disable-line global-require
  language: getStorage('lang') || 'en',
  appId: getStorage('appId') || 1,
};

export const addTokenIfValid = token =>
  new Promise((resolve, reject) => {
    const api = new LiveApi(options);
    api.authorize(token)
      .then((response) => {
        const landingCompanyName = response.authorize.landing_company_name;
        api.getLandingCompanyDetails(landingCompanyName).then(r => {
          addToken(token, response.authorize, !!r.landing_company_details.has_reality_check,
            ['iom', 'malta'].includes(landingCompanyName));
          api.disconnect();
          resolve(null);
        }, () => 0);
      }).catch(e => {
        removeToken(token);
        api.disconnect();
        reject(e);
      });
  });

export const logoutAllTokens = () =>
  new Promise(resolve => {
    const api = new LiveApi(options);
    const tokenList = getTokenList();
    const logout = () => {
      removeAllTokens();
      api.disconnect();
      resolve();
    };
    if (tokenList.length === 0) {
      logout();
    } else {
      api.authorize(tokenList[0].token)
        .then(() => {
          api.logOut().then(logout, logout);
        }, logout);
    }
  });
