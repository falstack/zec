const formatBlock = 'formatBlock';
const queryCommandState = command => document.queryCommandState(command);
const exec = (command, value = null) => document.execCommand(command, false, value);

export const actions = {
  bold: () => exec('bold'),
  italic: () => exec('italic'),
  underline: () => exec('underline'),
  strike: () => exec('strikeThrough'),
  heading: (n) => {
    if (typeof n === 'number' && n > 0 && n < 7) {
      exec(formatBlock, `<h${n}>`);
    }
  },
  paragraph: () => exec(formatBlock, '<p>'),
  quote: () => exec(formatBlock, '<blockquote>'),
  ol: () => exec('insertOrderedList'),
  ul: () => exec('insertUnorderedList'),
  code: () => exec(formatBlock, '<pre>'),
  line: () => exec('insertHorizontalRule'),
  link: (url) => {
    if (url) exec('createLink', url);
  },
  image: (url) => {
    if (url) exec('insertImage', url);
  },
};

export const states = {
  bold: queryCommandState('bold'),
  italic: queryCommandState('italic'),
  underline: queryCommandState('underline'),
  strike: queryCommandState('strikeThrough'),
};
