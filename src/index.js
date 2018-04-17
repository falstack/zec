import Event from './utils/event';

const env = process.env.NODE_ENV;

console.log('hello world');
console.log('dio: the world!');

class Editor extends Event {
  constructor() {
    super();
    this.initialize();
  }

  static initialize() {
    console.log('init');
  }
}

if (env === 'development') {
  window.editor = Editor;
}

export default Editor;
