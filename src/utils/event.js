import mitt from 'mitt';
// https://github.com/developit/mitt#api

export default class {
  constructor() {
    this.emitter = mitt();
  }

  on(event, handler) {
    return this.emitter.on(event, handler);
  }

  off(event, handler) {
    return this.emitter.on(event, handler);
  }

  emit(event, handler) {
    return this.emitter.on(event, handler);
  }
}
