// 和 UA 相关的属性
export const UA = {
  _ua: navigator.userAgent,

  // 是否 webkit
  isWebkit() {
    const reg = /webkit/i;
    return reg.test(this._ua);
  },

  // 是否 IE
  isIE() {
    return 'ActiveXObject' in window;
  },
};
