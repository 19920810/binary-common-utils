export default class Observer {
  constructor() {
    this.eventActionMap = {};
  }
  register(event, _action, once, unregisterIfError, unregisterAllBefore) {
    if (unregisterAllBefore) {
      this.unregisterAll(event);
    }
    let apiError = (error) => {
      if (error.type === unregisterIfError.type) {
        this.unregister('api.error', apiError);
        for (let unreg of unregisterIfError.unregister) {
          if (unreg instanceof Array) {
            this.unregister(...unreg);
          } else {
            this.unregisterAll(unreg);
          }
        }
      }
    };
    if (unregisterIfError) {
      this.register('api.error', apiError);
    }
    let action = (...args) => {
      if (once) {
        this.unregister(event, _action);
      }
      if (unregisterIfError) {
        this.unregister('api.error', apiError);
      }
      _action(...args);
    };
    let actionList = this.eventActionMap[event];
    if (actionList) {
      actionList.push({
        action,
        searchBy: _action,
      });
    } else {
      this.eventActionMap[event] = [{
        action,
        searchBy: _action,
      }];
    }
  }
  unregister(event, _function) {
    let actionList = this.eventActionMap[event];
    let i = actionList.findIndex((r) => r.searchBy === _function);
    if (i >= 0) {
      actionList.splice(i, 1);
    }
  }
  isRegistered(event) {
    return event in this.eventActionMap;
  }
  unregisterAll(event) {
    delete this.eventActionMap[event];
  }
  emit(event, data) {
    return new Promise((resolve) => {
      if (event in this.eventActionMap) {
				for (let action of this.eventActionMap[event]) {
          action.action(data);
				}
        resolve();
      }
    });
  }
}

export const observer = new Observer();
