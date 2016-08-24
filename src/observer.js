class Observer {
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
  unregister(event, _function) {
    if (!_function) {
      return;
    }
    let actionList = this.eventActionMap[event];
    for (let i of Object.keys(actionList)) {
      if (actionList[i].searchBy === _function) {
        actionList.splice(i, 1);
      }
    }
  }
  isRegistered(event) {
    return event in this.eventActionMap;
  }
  unregisterAll(event) {
    delete this.eventActionMap[event];
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
// eslint-disable-line
