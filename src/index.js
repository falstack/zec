import Event from './utils/event';
import $ from './utils/dom';
import { actions as execActions, states as execStates } from './utils/exec';

const env = process.env.NODE_ENV;

export default class Editor extends Event {
  constructor(selector, config = {}) {
    super();
    if (!(selector instanceof Element)) {
      throw new Error('please give a valid Element when create Editor');
    }
    this.$config = Object({}, this._defaultConfig(), config);
    this._initialize(selector);
  }

  _defaultConfig() {
    return {};
  }

  _initialize(selector) {
    this.$el = this._initDOM(selector);
  }

  _initDOM(selector) {
    const el = document.createElement('div');
    el.setAttribute('contenteditable', true);
    el.id = selector.id;
    el.classList = selector.classList;
    el.innerHTML = selector.innerHTML;
    selector.parentNode.insertBefore(el, selector);
    selector.parentNode.removeChild(selector);
    return el;
  }

  onInput(handler) {
    return this.$el.addEventListener('input', () => handler(this.$el.innerHTML));
  }

  onFocus(handler) {
    // TODO return range
    return this.$el.addEventListener('focus', () => handler(execStates));
  }

  onSelect(handler) {
    // TODO return selected string
    console.log(handler);
  }

  exec(command, value = null) {
    if (Object.keys(execActions).indexOf(command) !== 1) {
      execActions[command](value);
    }
  }
}

if (env === 'development') {
  window.editor = Editor;
  window.$ = $;
}
