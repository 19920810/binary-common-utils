export default class Observer {
  constructor() {
    this.eventActionMap = {};
  }
  register(event, unregisterIfError, unregisterAllBefore) {
    if (unregisterAllBefore) {
      this.unregisterAll(event);
    }
    let apiError = null;
    if (unregisterIfError) {
      apiError = (error) => {
        if (error.type === unregisterIfError.type) {
          this.unregister('api.error', apiError);
          unregisterIfError.unregister.forEach((unregister) => {
            if (unregister instanceof Array) {
              this.unregister(...unregister);
            } else {
              this.unregisterAll(unregister);
            }
          });
        }
      };
      this.register('api.error', apiError);
    }
    return this.makePromiseForEvent(event, apiError);
  }
  makePromiseForEvent(event, apiError) {
    return new Promise((resolve) => {
      this.unregister('api.error', apiError);
      let actionList = this.eventActionMap[event];
      if (actionList) {
        actionList.push(resolve);
      } else {
        this.eventActionMap[event] = [resolve];
      }
    });
  }
  unregister(event, func) {
    if (!func) {
      return;
    }
    let actionList = this.eventActionMap[event];
    for (let i of Object.keys(actionList)) {
      if (actionList[i] === func) {
        func({});
        actionList.splice(i, 1);
        return;
      }
    }
  }
  isRegistered(event) {
    return event in this.eventActionMap;
  }
  unregisterAll(event) {
    for (let action of this.eventActionMap[event]) {
      action({});
    }
    delete this.eventActionMap[event];
  }
  async keepAlive(promise, funcCall) {
    let res = await promise;
    if (!res.next) {
      return;
    }
    funcCall(res.data);
    await this.keepAlive(res.next, funcCall);
  }
  emit(event, data) {
    if (event in this.eventActionMap) {
      let tmp = this.eventActionMap[event];
      this.eventActionMap[event] = [];
      for (let action of tmp) {
        action({
          data,
          next: this.makePromiseForEvent(event),
        });
      }
    }
  }
}

export const observer = new Observer();
