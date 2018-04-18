/*
 DOM 操作 API
 */

// 根据 html 代码片段创建 dom 对象
function createElemByHTML(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.children;
}

// 是否是 DOM List
function isDOMList(domList) {
  if (!domList) {
    return false;
  }
  return domList instanceof HTMLCollection || domList instanceof NodeList;
}

// 封装 document.querySelectorAll
function querySelectorAll(selector) {
  const result = document.querySelectorAll(selector);
  if (isDOMList(result)) {
    return result;
  }
  return [result];
}

// function isWindow(obj) {
//   return obj != null && obj == obj.window;
// }

function isDocument(obj) {
  return obj !== null && obj.nodeType === obj.DOCUMENT_NODE;
}

function matches(element, selector) {
  if (!selector || !element || element.nodeType !== 1) return false;
  const matchesSelector = element.matches || element.webkitMatchesSelector ||
    element.mozMatchesSelector || element.oMatchesSelector ||
    element.matchesSelector;
  if (matchesSelector) return matchesSelector.call(element, selector);
  // fall back to performing a selector:
  let match = false;
  let parent = element.parentNode;
  const temp = !parent;
  const tempParent = document.createElement('div');
  if (temp) (parent = tempParent).appendChild(element);
  /* eslint-disable no-use-before-define */
  $(parent.querySelectorAll(selector)).forEach((node) => {
    if (node === element) {
      match = true;
    }
  });
  /* eslint-disable no-use-before-define */
  if (temp) {
    tempParent.removeChild(element);
  }
  return match;
}

// 创建构造函数
function DomElement(selector) {
  if (!selector) {
    this.length = 0;
    return this;
  }

  // selector 本来就是 DomElement 对象，直接返回
  if (selector instanceof DomElement) {
    return selector;
  }

  this.selector = selector;

  // 根据 selector 得出的结果（如 DOM，DOM List）
  let selectorResult = [];
  if (selector.nodeType) {
    // if (selector.nodeType === 1) {
    // 单个 DOM 节点
    selectorResult = [selector];
  } else if (isDOMList(selector)) {
    // DOM List
    selectorResult = selector;
    // 如果是个数组节点
  } else if (selector instanceof Array) {
    // 过滤null undefined等无效数据
    selectorResult = selector.filter(v => !!v);
  } else if (typeof selector === 'string') {
    // 字符串
    const str = selector.replace('/\n/mg', '').trim();
    if (str.indexOf('<') === 0) {
      // 如 <div>
      selectorResult = createElemByHTML(str);
    } else {
      // 如 #id .class
      selectorResult = querySelectorAll(str);
    }
  }

  const length = selectorResult.length;
  if (!length) {
    // 空数组
    this.length = 0;
    return this;
  }

  // 加入 DOM 节点
  let i;
  for (i = 0; i < length; i++) {
    this[i] = selectorResult[i];
  }
  this.length = length;
}

// 修改原型
/* eslint-disable object-shorthand, func-names, no-param-reassign */
DomElement.prototype = {
  constructor: DomElement,

  // 类数组，forEach
  forEach: function (fn) {
    let i;
    for (i = 0; i < this.length; i++) {
      const elem = this[i];
      const result = fn.call(elem, elem, i);
      if (result === false) {
        break;
      }
    }
    return this;
  },

  closest: function (selector, context) {
    const nodes = [];
    const collection = typeof selector === 'object' && $(selector);
    this.forEach((node) => {
      while (node && !(collection ? collection.indexOf($(node)) >= 0 : matches(node, selector))) {
        node = node !== context && !isDocument(node) && node.parentNode;
      }
      if (node && nodes.indexOf(node) < 0) nodes.push(node);
    });
    return $(nodes);
  },

  // 获取第几个元素
  get: function (index) {
    const length = this.length;
    if (index >= length) {
      index %= length;
    }
    return $(this[index]);
  },

  // 第一个
  first: function () {
    return this.get(0);
  },

  // 最后一个
  last: function () {
    const length = this.length;
    return this.get(length - 1);
  },

  pre: function () {
    const elems = [];
    this.forEach((node) => {
      elems.push(node.previousElementSibling);
    });
    return $(elems);
  },

  preNode: function () {
    const elems = [];
    this.forEach((node) => {
      if (node.previousSibling) {
        elems.push(node.previousSibling);
      }
    });
    return $(elems);
  },

  next: function () {
    const elems = [];
    this.forEach((node) => {
      elems.push(node.nextElementSibling);
    });
    return $(elems);
  },

  nextNode: function () {
    const elems = [];
    this.forEach((node) => {
      elems.push(node.nextSibling);
    });
    return $(elems);
  },

  // 绑定事件
  on: function (eventType, selector, fn) {
    // selector 不为空，证明绑定事件要加代理
    if (!fn) {
      fn = selector;
      selector = null;
    }

    // type 是否有多个
    let types = [];
    types = eventType.split(/\s+/);

    return this.forEach((elem) => {
      types.forEach((type) => {
        if (!type) {
          return;
        }

        if (!selector) {
          // 无代理
          elem.addEventListener(type, fn, false);
          return;
        }

        // 有代理
        elem.addEventListener(type, (e) => {
          const match = $(e.target).closest(selector, elem).get(0);
          // console.log('delegate event',e,selector,match)
          if (match.length && match !== elem) {
            fn.call(match, e);
          }
        }, false);
      });
    });
  },

  // 取消事件绑定
  off: function (type, fn) {
    return this.forEach((elem) => {
      elem.removeEventListener(type, fn, false);
    });
  },

  /* eslint-disable prefer-rest-params */
  data: function (name, value) {
    const attrName = `data-${name.replace(/([A-Z])/, '-$1').toLowerCase()}`;

    const data = (1 in arguments) ?
      this.attr(attrName, value) :
      this.attr(attrName);

    return data !== null ? data : undefined;
  },

  /* eslint-disable prefer-rest-params */
  // 获取/设置 属性
  attr: function (key, val) {
    if (!val) {
      // 获取值
      return this[0].getAttribute(key);
    }
    // 设置值
    return this.forEach((elem) => {
      elem.setAttribute(key, val);
    });
  },

  // 支持多个className,只需要包含其中一个即可
  hasClass: function (className) {
    let result = false;
    if (!className) {
      return result;
    }
    this.forEach((elem) => {
      let arr;
      if (elem.className) {
        // 解析当前 className 转换为数组
        arr = elem.className.split(/\s/);
        className = className.split(/\s/);
        arr = arr.filter((item) => {
          item = item.trim();
          if (item && className.indexOf(item) > -1) {
            return item;
          }
          return false;
        });
        if (arr.length) {
          result = true;
        }
      }
    });
    return result;
  },

  // 添加 class
  addClass: function (className) {
    if (!className) {
      return this;
    }
    return this.forEach((elem) => {
      let arr;
      if (elem.className) {
        // 解析当前 className 转换为数组
        arr = elem.className.split(/\s/);
        arr = arr.filter(item => !!item.trim());
        // 添加 class
        if (arr.indexOf(className) < 0) {
          arr.push(className);
        }
        // 修改 elem.class
        elem.className = arr.join(' ');
      } else {
        elem.className = className;
      }
    });
  },

  // 删除 class
  removeClass: function (className) {
    if (!className) {
      return this;
    }
    return this.forEach((elem) => {
      let arr;
      if (elem.className) {
        // 解析当前 className 转换为数组
        arr = elem.className.split(/\s/);
        arr = arr.filter((item) => {
          item = item.trim();
          // 删除 class
          return !(!item || item === className);
        });
        // 修改 elem.class
        elem.className = arr.join(' ');
      }
    });
  },

  // 修改 css
  css: function (key, val) {
    const currentStyle = `${key}:${val};`;
    return this.forEach((elem) => {
      const style = (elem.getAttribute('style') || '').trim();
      let styleArr;
      let resultArr = [];
      if (style) {
        // 将 style 按照 ; 拆分为数组
        styleArr = style.split(';');
        styleArr.forEach((item) => {
          // 对每项样式，按照 : 拆分为 key 和 value
          const arr = item.split(':').map(i => i.trim());
          if (arr.length === 2) {
            resultArr.push(`${arr[0]}:${arr[1]}`);
          }
        });
        // 替换或者新增
        resultArr = resultArr.map((item) => {
          if (item.indexOf(key) === 0) {
            return currentStyle;
          }
          return item;
        });
        if (resultArr.indexOf(currentStyle) < 0) {
          resultArr.push(currentStyle);
        }
        // 结果
        elem.setAttribute('style', resultArr.join('; '));
      } else {
        // style 无值
        elem.setAttribute('style', currentStyle);
      }
    });
  },

  removeAttr: function (name) {
    return this.forEach((node) => {
      node.removeAttribute(name);
    });
  },
  // 显示
  show: function () {
    return this.css('display', 'block');
  },

  // 隐藏
  hide: function () {
    return this.css('display', 'none');
  },

  // 获取子节点
  children: function () {
    const elem = this[0];
    if (!elem) {
      return $([]);
    }

    return $(elem.children);
  },

  // 增加子节点
  append: function ($children) {
    return this.forEach((elem) => {
      $children.forEach((child) => {
        elem.appendChild(child);
      });
    });
  },

  prepend: function ($children) {
    return this.forEach((elem) => {
      $children.forEach((child) => {
        elem.insertBefore(child, elem.firstChild);
      });
    });
  },

  // 移除当前节点
  remove: function () {
    return this.forEach((elem) => {
      if (elem.remove) {
        elem.remove();
      } else {
        const parent = elem.parentElement;
        if (parent) {
          parent.removeChild(elem);
        }
      }
    });
  },

  replace: function ($elem) {
    return this.forEach((elem) => {
      $elem.insertBefore($(elem));
      $(elem).remove();
    });
  },

  // 是否包含某个子节点
  isContain: function ($child) {
    const elem = this[0];
    const child = $child[0];
    if (!elem || !child) {
      return false;
    }
    return elem.contains(child);
  },

  // 尺寸数据
  getBoundingClientRect: function () {
    const elem = this[0];
    return elem.getBoundingClientRect(); // 可得到 bottom height left right top width 的数据
  },

  // 封装 nodeName
  getNodeName: function () {
    const elem = this[0];
    if (!elem) {
      return '';
    }
    return elem.nodeName && elem.nodeName.toUpperCase();
  },

  // 向parent查找，直到遇到utilElem, 没查到返回false
  findReverse: function (classNames, utilElem = $(document)) {
    let result = false;
    let elem = this;
    while (!utilElem.equal(elem) && !utilElem.equal($(document))) {
      if (elem.hasClass(classNames)) {
        result = elem;
        break;
      }
      elem = elem.parent();
    }
    return result;
  },

  // 从当前元素查找
  find: function (selector) {
    const elem = this[0];
    return $(elem.querySelectorAll(selector));
  },

  clone: function () {
    const elem = this[0];
    return $(elem.cloneNode(true));
  },

  // 获取当前元素的 text
  text: function (val) {
    if (!val) {
      // 获取 text
      const elem = this[0];
      if (elem) {
        return elem.innerText || elem.textContent || '';
      }
      return '';
      // return elem.innerHTML.replace(/<.*?>/g, () => '')
    }
    // 设置 text
    return this.forEach((elem) => {
      elem.textContent = val;
    });
  },

  // 获取 html
  html: function (value) {
    const elem = this[0];
    if (!elem) {
      return '';
    }
    if (!value) {
      return elem.innerHTML || '';
    }
    elem.innerHTML = value;
    return this;
  },

  contents: function () {
    const elem = this[0];
    if (!elem) {
      return $();
    }
    return $(elem.contentDocument || Array.prototype.slice.call(elem.childNodes));
  },

  // 获取 value
  val: function () {
    const elem = this[0];
    return elem.value.trim();
  },

  // focus
  focus: function () {
    return this.forEach((elem) => {
      elem.focus();
    });
  },

  // parent
  parent: function () {
    const elem = this[0];
    if (elem) {
      return $(elem.parentElement);
    }
    return $(elem);
  },

  // 判断两个 elem 是否相等
  equal: function ($elem) {
    if ($elem.nodeType === 1) {
      return this[0] === $elem;
    }
    return this[0] === $elem[0];
  },

  before: function (elem) {
    return elem.insertBefore(this);
  },

  after: function (elem) {
    return elem.insertAfter(this);
  },
  // 将该元素插入到某个元素前面
  insertBefore: function (selector) {
    const $referenceNode = $(selector);
    const referenceNode = $referenceNode[0];
    if (!referenceNode) {
      return this;
    }
    return this.forEach((elem) => {
      const parent = referenceNode.parentNode;
      if (parent) {
        parent.insertBefore(elem, referenceNode);
      }
    });
  },

  // 将该元素插入到某个元素后面
  insertAfter: function (selector) {
    const $referenceNode = $(selector);
    const referenceNode = $referenceNode[0];
    if (!referenceNode) {
      return this;
    }
    return this.forEach((elem) => {
      const parent = referenceNode.parentNode;
      if (!parent) {
        return;
      }
      // console.log("insertAfter:::===",parent,referenceNode,elem)
      if (parent.lastChild === referenceNode) {
        // 最后一个元素
        parent.appendChild(elem);
      } else {
        // 不是最后一个元素
        parent.insertBefore(elem, referenceNode.nextSibling);
      }
    });
  },

  is: function (selector) {
    return typeof selector === 'string' ? this.length > 0 && matches(this[0], selector) :
      selector && this.selector === selector.selector;
  },

  wrap: function (structure) {
    return this.forEach((elem) => {
      if (typeof structure === 'string') {
        $(elem).before(structure = $(structure));
      } else {
        $(elem).before(structure);
      }
      structure.append($(elem));
    });
  },

  unwrap: function () {
    return this.forEach((elem) => {
      $(elem).parent().replace($(elem));
    });
  },

  // 把所有的childNodes放到外面
  unpack: function () {
    return this.forEach((elem) => {
      elem = $(elem);
      elem.contents().forEach((child) => {
        elem.before($(child));
      });
      elem.remove();
    });
  },
};

// new 一个对象
export default function $(selector) {
  return new DomElement(selector);
}
