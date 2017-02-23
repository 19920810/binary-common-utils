import { Map } from 'immutable';
import { LiveApi } from 'binary-live-api';
import { get as getStorage } from './storageManager';

export default class CustomApi {
  constructor(observer, websocketMock = null, onClose = null, connection = null) {
    this.rtm = new Map(); // proposal type map
    this.observer = observer;
    let option = {};
    if (typeof window !== 'undefined') {
      option = {
        language: getStorage('lang') || 'en',
        appId: getStorage('appId') || 0,
      };
    }
    if (websocketMock) {
      option.websocket = websocketMock;
    } else {
      option.keepAlive = true;
    }
    if (connection) {
      option.connection = connection;
    }
    const requestHandlers = {
      tick: () => 0,
      error: () => 0,
      ohlc: () => 0,
      candles: () => 0,
      forget_all: () => 0,
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
    this.responseHandlers = {
      history: (response) => {
        const ticks = [];
        const history = response.history;
        history.times.forEach((time, index) => {
          ticks.push({
            epoch: +time,
            quote: +history.prices[index],
          });
        });
        this.observer.emit('api.history', ticks);
      },
      tick: (response) => {
        const tick = response.tick;
        this.observer.emit('api.tick', {
          epoch: +tick.epoch,
          quote: +tick.quote,
        });
      },
      candles: (response) => {
        const candlesList =
          response.candles.map(o => ({
            open: +o.open,
            high: +o.high,
            low: +o.low,
            close: +o.close,
            epoch: +o.epoch,
          }));
        this.observer.emit('api.candles', candlesList);
      },
      ohlc: (response) => {
        const ohlc = response.ohlc;
        this.observer.emit('api.ohlc', {
          open: +ohlc.open,
          high: +ohlc.high,
          low: +ohlc.low,
          close: +ohlc.close,
          epoch: +ohlc.open_time,
        });
      },
      authorize: (response) => {
        this.observer.emit('api.authorize', response.authorize);
      },
      error: (response) => {
        this.observer.emit('api.error', response);
      },
      _default: (response, type) => {
        this.observer.emit('api.log', response);
        response[type].echo_req = response.echo_req;
        this.observer.emit('api.' + type, response[type]);
      },
    };
    option.sendSpy = e => {
      const reqData = JSON.parse(e);
      if (reqData.proposal) {
        this.rtm = this.rtm.set(reqData.req_id, reqData.contract_type);
      } else if (reqData.forget_all && reqData.forget_all === 'proposal') {
        this.rtm = new Map();
      }
    };
    this.originalApi = new LiveApi(option);
    Object.keys(requestHandlers).forEach(type => {
      const responseHander = (!this.responseHandlers[type]) ?
        this.responseHandlers._default : this.responseHandlers[type]; // eslint-disable-line no-underscore-dangle
      this.originalApi.events.on(type, data => { // eslint-disable-line no-loop-func
        if (this.destroyed) {
          return;
        }
        if ('error' in data) {
          this.responseHandlers.error(data);
        } else {
          if ('proposal' in data) {
            data.proposal.contract_type = this.rtm.get(data.req_id);
          }
          responseHander(data, type);
        }
      });
      this[type] = (...args) => {
        this.handlePromiseForCalls(type, args, requestHandlers);
      };
    });
  }
  handlePromiseForCalls(type, args, requestHandlers) {
    const promise = requestHandlers[type](...args);
    if (promise instanceof Promise) {
      promise.then(() => {}, (err) => {
        if (type === 'buy') {
          this.responseHandlers.error(err);
        }
      });
    }
  }
  destroy() {
    this.originalApi.disconnect();
    this.destroyed = true;
  }
}
