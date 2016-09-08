import { LiveApi } from 'binary-live-api';
import { observer } from './observer';
import { get as getStorage } from './storageManager';

export default class CustomApi {
  constructor(websocketMock = null, onClose = null) {
    let option = {};
    this.proposalIdMap = {};
    this.seenProposal = {};
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
    this.events = {
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
      tick: (response, type) => {
        if (!this.apiFailed(response, type)) {
          let tick = response.tick;
          observer.emit('api.tick', {
            epoch: +tick.epoch,
            quote: +tick.quote,
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
          if (!(data.proposal.id in this.seenProposal)) {
            this.seenProposal[data.proposal.id] = true;
          } else {
            data.proposal.contract_type = this.proposalIdMap[data.proposal.id];
            event(data, e);
          }
        } else {
          event(data, e);
        }
      });
      this[e] = (...args) => {
        let promise = events[e](...args);
        if (promise instanceof Promise) {
          promise.then((pd) => {
            if (e === 'proposal') {
              this.proposalIdMap[pd.proposal.id] = args[0].contract_type;
              pd.proposal.contract_type = args[0].contract_type;
              event(pd, e);
            }
          }, () => 0);
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
