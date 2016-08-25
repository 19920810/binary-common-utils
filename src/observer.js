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
  async keepAlive(initPromise, funcCall) {
    let promise = initPromise;
    let forever = true;
    while (forever) {
      let res = await promise;
      funcCall(res.data);
      if (!res.next) {
        return;
      }
      promise = res.next;
    }
  }
  emit(event, data) {
    if (event in this.eventActionMap) {
      this.eventActionMap[event].forEach((action, i) => {
        delete this.eventActionMap[event][i];
        action({
          data,
          next: this.makePromiseForEvent(event),
        });
      });
    }
  }
}

export const observer = new Observer();

