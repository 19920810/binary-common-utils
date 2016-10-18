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
        observer.emit('api.' + type, response[type]);
      },
    };
    this.originalApi = new LiveApi(option);
    for (const e of Object.keys(requestHandlers)) {
      const responseHander = (!this.responseHandlers[e]) ?
        this.responseHandlers._default : this.responseHandlers[e]; // eslint-disable-line no-underscore-dangle
      this.originalApi.events.on(e, (data) => {
        if (this.destroyed) {
          return;
        }
        if ('error' in data) {
          this.responseHandlers.error(data);
          this.proposalIdMap = {};
          this.seenProposal = {};
        } else if (data.msg_type === 'proposal') {
          if (!(data.proposal.id in this.seenProposal)) {
            this.seenProposal[data.proposal.id] = true;
          } else {
            data.proposal.contract_type = this.proposalIdMap[data.proposal.id];
            responseHander(data, e);
          }
        } else {
          if (e === 'forget_all') {
            if (data.echo_req && data.echo_req.forget_all === 'proposal') {
              this.proposalIdMap = {};
              this.seenProposal = {};
            }
          }
          responseHander(data, e);
        }
      });
      this[e] = (...args) => {
        this.handlePromiseForCalls(e, args, requestHandlers, responseHander);
      };
    }
  }
  handlePromiseForCalls(e, args, requestHandlers, responseHander) {
    const promise = requestHandlers[e](...args);
    if (promise instanceof Promise) {
      promise.then((pd) => {
        if (e === 'proposal') {
          this.proposalIdMap[pd.proposal.id] = args[0].contract_type;
          pd.proposal.contract_type = args[0].contract_type;
          responseHander(pd, e);
        }
      }, (err) => {
        if (err.name === 'DisconnectError') {
          this.handlePromiseForCalls(e, args, requestHandlers, responseHander);
        }
      });
    }
  }
  destroy() {
    this.originalApi.socket.close();
    this.destroyed = true;
    this.proposalIdMap = {};
    this.seenProposal = {};
  }
}
