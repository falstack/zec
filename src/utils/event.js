import mitt from 'mitt';
// https://github.com/developit/mitt#api

export default class {
  constructor() {
    this.__event__ = mitt();
  }

  _on(event, handler) {
    return this.__event__.on(event, handler);
  }

  _off(event, handler) {
    return this.__event__.on(event, handler);
  }

  _emit(event, handler) {
    return this.__event__.on(event, handler);
  }
}
