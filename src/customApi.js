import { LiveApi } from 'binary-live-api';
import { observer } from './observer';
import { get as getStorage } from './storageManager';

export default class CustomApi {
  constructor(websocketMock = null, onClose = null) {
    let option = {};
    this.proposalMap = {};
    if (typeof window !== 'undefined') {
      option = {
        language: getStorage('lang'),
        appId: getStorage('appId'),
      };
    }
    if (websocketMock) {
      option.websocket = websocketMock;
    } else {
      option.keepAlive = true;
    }
    let events = {
      tick: () => 0,
      error: () => 0,
      ohlc: () => 0,
      candles: () => 0,
      history: (symbol, args) => this.originalApi.getTickHistory(symbol, args),
      proposal_open_contract: (contractId) => this.originalApi.subscribeToOpenContract(contractId),
      proposal: (...args) => this.originalApi.subscribeToPriceForContractProposal(...args),
      buy: (...args) => this.originalApi.buyContract(...args),
      authorize: (...args) => this.originalApi.authorize(...args),
      balance: (...args) => this.originalApi.subscribeToBalance(...args),
    };
    if (onClose) {
      LiveApi.prototype.onClose = onClose;
    }
    let originalSendRaw = LiveApi.prototype.sendRaw;
    let that = this;
    LiveApi.prototype.sendRaw = function sendRaw(json) {
      if ('proposal' in json) {
        for (let key of Object.keys(that.proposalMap)) {
          if (that.proposalMap[key] === json.contract_type) {
            delete that.proposalMap[key];
          }
        }
        that.proposalMap[json.req_id] = json.contract_type;
      }
      originalSendRaw.call(this, json);
    };
    this.events = {
      ohlc: (response, type) => {
        if (!this.apiFailed(response, type)) {
          let ohlc = response.ohlc;
          observer.emit('api.ohlc', {
            open: +ohlc.open,
            high: +ohlc.high,
            low: +ohlc.low,
            close: +ohlc.close,
            epoch: +ohlc.open_time,
          });
        }
      },
      candles: (response, type) => {
        if (!this.apiFailed(response, type)) {
          let candlesList = [];
          let candles = response.candles;
          for (let o of candles) {
            candlesList.push({
              open: +o.open,
              high: +o.high,
              low: +o.low,
              close: +o.close,
              epoch: +o.epoch,
            });
          }
          observer.emit('api.candles', candlesList);
        }
      },
      tick: (response, type) => {
        if (!this.apiFailed(response, type)) {
          let tick = response.tick;
          observer.emit('api.tick', {
            epoch: +tick.epoch,
            quote: +tick.quote,
          });
        }
      },
      history: (response, type) => {
        if (!this.apiFailed(response, type)) {
          let ticks = [];
          let history = response.history;
          history.times.forEach((time, index) => {
            ticks.push({
              epoch: +time,
              quote: +history.prices[index],
            });
          });
          observer.emit('api.history', ticks);
        }
      },
      authorize: (response, type) => {
        if (!this.apiFailed(response, type)) {
          observer.emit('api.authorize', response.authorize);
        }
      },
      error: (response, type) => {
        if (!this.apiFailed(response, type)) {
          response.error.type = type;
          observer.emit('api.error', response);
          observer.emit('api.' + type, response[type]);
        }
      },
      _default: (response, type) => {
        if (!this.apiFailed(response, type)) {
          observer.emit('api.log', response);
          observer.emit('api.' + type, response[type]);
        }
      },
    };
    this.originalApi = new LiveApi(option);
    for (let e of Object.keys(events)) {
      let event = (!this.events[e]) ?
        this.events._default : this.events[e]; // eslint-disable-line no-underscore-dangle
      this.originalApi.events.on(e, (data) => {
        if (this.destroyed) {
          return;
        }
        if (data.msg_type === 'proposal') {
          data.proposal.contract_type = this.proposalMap[data.req_id];
        }
        event(data, e);
      });
      this[e] = (...args) => {
        let promise = events[e](...args);
        if (promise instanceof Promise) {
          promise.then(() => 0, () => 0);
        }
      };
    }
  }
  apiFailed(response, type) {
    if (response.error) {
      response.error.type = type;
      observer.emit('api.error', response.error);
      return true;
    }
    return false;
  }
  destroy() {
    this.destroyed = true;
  }
}
