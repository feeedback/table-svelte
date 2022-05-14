/* eslint-disable no-useless-concat */
/* eslint-disable eqeqeq */
// import { isExpression, isEmptyExpression, isInvalidExpression } from './utils.js';

export const mapMarkToFn = {
  '>=': (pivot) => (x) => x >= pivot,
  '>': (pivot) => (x) => x > pivot,
  '<=': (pivot) => (x) => x <= pivot,
  '<': (pivot) => (x) => x < pivot,
  // eslint-disable-next-line eqeqeq
  '=': (pivot) => (x) => x == pivot,
};
export const marksSet = new Set(Object.keys(mapMarkToFn));
const marks = [...marksSet].sort((a, b) => b.length - a.length);

export const parseOneExpression = (expression) => {
  const indexMarkEnd = expression[1] === '=' ? 2 : 1;

  const mark = expression.slice(0, indexMarkEnd);
  const pivotValue = expression.slice(indexMarkEnd);

  if (!marksSet.has(mark)) {
    return null;
  }
  if (pivotValue === '') {
    return { mark, pivotValue: '' };
  }
  if (Number.isNaN(Number(pivotValue))) {
    return null;
  }
  return { mark, pivotValue: Number(pivotValue) };
};

export const parseExpression = (expressionRaw) => {
  const expression = expressionRaw.replace(/\s/g, '');
  const conditions = expression.split('&');

  if (conditions.length > 2) {
    return [null];
  }

  const parsed = conditions.map((cond) => parseOneExpression(cond));

  if (conditions.length > 1 && (parsed[0]?.mark === '=' || parsed[1]?.mark === '=')) {
    return [null];
  }
  if (conditions.length == 2 && conditions[1] === '') {
    return [parsed[0]];
  }
  if (parsed.includes(null)) {
    return [null];
  }
  if (conditions.length > 1 && parsed[1].pivotValue === '') {
    return [parsed[0]];
  }

  return parsed;
};

// export const isExpression = (str) =>
//   str.startsWith('<') || str.startsWith('>') || str.startsWith('=');
export const isExpression = (str) => str && /^[>=<]/.test(str);
export const isEmptyExpression = (str) => marks.some((mark) => str === mark);
export const isInvalidExpression = (exp) => parseExpression(exp).includes(null);
export const isValidExpression = (exp) => isExpression(exp) && !isInvalidExpression(exp);

export const getExpressionCheckFn = (exp) => {
  if (exp.length > 1) {
    const [{ mark: m1, pivotValue: v1 }, { mark: m2, pivotValue: v2 }] = exp;

    return (x) => mapMarkToFn[m1](v1)(x) && mapMarkToFn[m2](v2)(x);
  }
  const [{ mark, pivotValue }] = exp;

  return mapMarkToFn[mark](pivotValue);
};

// export const isNeedAnimateFilterBadExpression = (exp) =>
//   isExpression(exp) && !isEmptyExpression(exp) && isInvalidExpression(exp);

export const animateFilterBadExpression = (elem, conditionalFn = () => true) => {
  const SHAKE_CLASS = 'shake';

  if (conditionalFn()) {
    elem.classList.remove(SHAKE_CLASS);
    // eslint-disable-next-line no-void
    void elem.offsetWidth;
    elem.classList.add(SHAKE_CLASS);
  } else {
    elem.classList.remove(SHAKE_CLASS);
  }
};

export const iconSymbols = {
  sortAsc: '&#x' + 'e5d8;', // e5d8 e5c7 ↑ ▲
  sortDesc: '&#x' + 'e5db', // e5db e5c5 ↓ ▼

  pagePrev: '&#x' + 'e408;', // ⯇ ⏪ ◀ e408 e5e0 e01f
  pageNext: '&#x' + 'e409;', // ⯈ ⏩   e409 e5e1 e020
  pageFirst: '&#x' + 'e5dc;', // ⏮ e5dc e045
  pageLast: '&#x' + 'e5dd;', //  ⏭ e5dd e044

  removeColumn: '&#x' + 'e15b;', // e15b e872 e5cd ✀ 🛇 🞩 🞪 🗑 ❌
  addColumn: '&#x' + 'e145;', // 🞣 🞤 🞥 ＋ + ✚
};
export const iconSymbolsByOrder = {
  1: iconSymbols['sortAsc'],
  '-1': iconSymbols['sortDesc'],
};

export const THIN_SPACE = '&#8239;';
export const delimiterSymbols = `${THIN_SPACE}/${THIN_SPACE}`;

export const highlightQueryInFiltered = (queryValue, value) => {
  if (queryValue === null || !queryValue || isExpression(queryValue)) {
    return value;
  }

  const queryValueStr = String(queryValue).toLowerCase();
  const strValue = String(value);
  const queryLen = queryValue.length;
  const queryStart = strValue.toLowerCase().indexOf(queryValueStr);
  const queryEnd = queryStart + queryLen;

  return [
    strValue.slice(0, queryStart),
    '<mark>',
    strValue.slice(queryStart, queryEnd),
    '</mark>',
    strValue.slice(queryEnd),
  ].join('');
};
