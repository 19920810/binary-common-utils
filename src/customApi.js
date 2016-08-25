import { LiveApi } from 'binary-live-api';
import { observer } from './observer';
import { get as getStorage } from './storageManager';

export default class CustomApi extends LiveApi {
  constructor(websocketMock, onClose) {
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
    super();
    if (onClose) {
      super.onClose = onClose;
    }
    let sendRawBackup = LiveApi.prototype.sendRaw;
    super.sendRaw = (json) => {
      if ('proposal' in json) {
        for (let key of Object.keys(this.proposalMap)) {
          if (this.proposalMap[key] === json.contract_type) {
            delete this.proposalMap[key];
          }
        }
        this.proposalMap[json.req_id] = json.contract_type;
      }
      sendRawBackup.call(this, json);
    };
    this.proposalMap = {};
    this.transformers = {
      ohlc: (response) => {
        let ohlc = response.ohlc;
        observer.emit('api.ohlc', {
          open: +ohlc.open,
          high: +ohlc.high,
          low: +ohlc.low,
          close: +ohlc.close,
          epoch: +ohlc.open_time,
        });
      },
      candles: (response) => {
        let candlesList = [];
        for (let ohlc of response.candles) {
          candlesList.push({
            open: +ohlc.open,
            high: +ohlc.high,
            low: +ohlc.low,
            close: +ohlc.close,
            epoch: +ohlc.epoch,
          });
        }
        observer.emit('api.candles', candlesList);
      },
      tick: (response) => {
        let tick = response.tick;
        observer.emit('api.tick', {
          epoch: +tick.epoch,
          quote: +tick.quote,
        });
      },
      history: (response) => {
        let ticks = [];
        let history = response.history;
        history.times.forEach((time, index) => {
          ticks.push({
            epoch: +time,
            quote: +history.prices[index],
          });
        });
        observer.emit('api.history', ticks);
      },
      error: (response, type) => {
        response.error.type = type;
        observer.emit('api.error', response.error);
      },
      default: (response, type) => {
        observer.emit('api.' + type, response[type]);
      },
    };
    for (let e of [
        'error', 'tick', 'ohlc', 'candles',
        'history', 'proposal_open_contract', 'proposal', 'buy', 'authorize', 'balance',
    ]) {
      let tEvent = (!this.transformers[e]) ? this.transformers.default : this.transformers[e];
      this.events.on(e, (data) => {
        if (this.destroyed) {
          return;
        }
        if (data.msg_type === 'proposal') {
          data.proposal.contract_type = this.proposalMap[data.req_id];
        }
        tEvent(data, e);
      });
    }
  }

  history(...args) {
    return this.getTickHistory(...args);
  }

  proposal_open_contract(contractId) {
    return this.send({
      proposal_open_contract: 1,
      contract_id: contractId,
      subscribe: 1,
    });
  }

  proposal(...args) {
    return this.subscribeToPriceForContractProposal(...args);
  }

  buy(...args) {
    return this.buyContract(...args);
  }

  authorize(...args) {
    return super.authorize(...args);
  }

  balance(...args) {
    return this.subscribeToBalance(...args);
  }

  destroy() {
    this.destroyed = true;
  }
}
