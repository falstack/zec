import mitt from 'mitt';
// https://github.com/developit/mitt#api

export default class {
  constructor() {
    this.evt = mitt();
  }

  on(event, handler) {
    return this.evt.on(event, handler);
  }

  off(event, handler) {
    return this.evt.on(event, handler);
  }

  emit(event, handler) {
    return this.evt.on(event, handler);
  }
}
