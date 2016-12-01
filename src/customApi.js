import { LiveApi } from 'binary-live-api';
import { observer } from './observer';
import { get as getStorage } from './storageManager';

let proposalTypeMap = {};

export default class CustomApi {
  constructor(websocketMock = null, onClose = null, connection = null) {
    let option = {};
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
        observer.emit('api.history', ticks);
      },
      tick: (response) => {
        const tick = response.tick;
        observer.emit('api.tick', {
          epoch: +tick.epoch,
          quote: +tick.quote,
        });
      },
      candles: (response) => {
        const candlesList = [];
        const candles = response.candles;
        for (const o of candles) {
          candlesList.push({
            open: +o.open,
            high: +o.high,
            low: +o.low,
            close: +o.close,
            epoch: +o.epoch,
          });
        }
        observer.emit('api.candles', candlesList);
      },
      ohlc: (response) => {
        const ohlc = response.ohlc;
        observer.emit('api.ohlc', {
          open: +ohlc.open,
          high: +ohlc.high,
          low: +ohlc.low,
          close: +ohlc.close,
          epoch: +ohlc.open_time,
        });
      },
      authorize: (response) => {
        observer.emit('api.authorize', response.authorize);
      },
      error: (response) => {
        observer.emit('api.error', response);
      },
      _default: (response, type) => {
        observer.emit('api.log', response);
        response[type].echo_req = response.echo_req;
        observer.emit('api.' + type, response[type]);
      },
    };
    option.sendSpy = e => {
      const reqData = JSON.parse(e);
      console.log(reqData);
      if (reqData.proposal) {
        proposalTypeMap[reqData.req_id] = reqData.contract_type;
      } else if (reqData.forget_all && reqData.forget_all === 'proposal') {
        proposalTypeMap = {};
      }
    };
    this.originalApi = new LiveApi(option);
    for (const type of Object.keys(requestHandlers)) {
      const responseHander = (!this.responseHandlers[type]) ?
        this.responseHandlers._default : this.responseHandlers[type]; // eslint-disable-line no-underscore-dangle
      this.originalApi.events.on(type, (data) => {
        if (this.destroyed) {
          return;
        }
        if ('error' in data) {
          this.responseHandlers.error(data);
        } else {
          if ('proposal' in data) {
            data.proposal.contract_type = proposalTypeMap[data.req_id];
          }
          responseHander(data, type);
        }
      });
      this[type] = (...args) => {
        this.handlePromiseForCalls(type, args, requestHandlers, responseHander);
      };
    }
  }
  handlePromiseForCalls(type, args, requestHandlers, responseHander) {
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
    this.originalApi.socket.close();
    this.destroyed = true;
  }
}
