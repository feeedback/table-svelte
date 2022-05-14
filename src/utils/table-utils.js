/* eslint-disable no-useless-concat */
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
  const count = conditions.length;

  const parsed = conditions.map((cond) => parseOneExpression(cond));

  if (count > 1 && parsed.some((exp) => exp && exp.mark === '=')) {
    return null;
  }
  if (count > 1 && conditions.at(-1) === '') {
    return parsed.slice(0, -1);
  }
  if (parsed.includes(null)) {
    return null;
  }
  if (count > 1 && conditions.at(-1).pivotValue === '') {
    return parsed.slice(0, -1);
  }

  return parsed;
};

export const isExpression = (str) => str && /^[>=<]/.test(str);
export const isEmptyExpression = (str) => marks.some((mark) => str === mark);
export const isInvalidExpression = (exp) => parseExpression(exp) === null;
export const isValidExpression = (exp) => isExpression(exp) && !isInvalidExpression(exp);

export const getExpressionCheckFn = (exp) => (queryValue) =>
  exp.every(({ mark, pivotValue }) => mapMarkToFn[mark](pivotValue)(queryValue));

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
  sort: {
    asc: '&#x' + 'e5d8;', // e5d8 e5c7 ↑ ▲
    desc: '&#x' + 'e5db', // e5db e5c5 ↓ ▼
  },
  page: {
    prev: '&#x' + 'e408;', // ⯇ ⏪ ◀ e408 e5e0 e01f
    next: '&#x' + 'e409;', // ⯈ ⏩   e409 e5e1 e020
    first: '&#x' + 'e5dc;', // ⏮ e5dc e045
    last: '&#x' + 'e5dd;', //  ⏭ e5dd e044
  },

  column: {
    add: '&#x' + 'e145;', // 🞣 🞤 🞥 ＋ + ✚
    hide: '&#x' + 'e15b;', // e15b e872 e5cd ✀ 🛇 🞩 🞪 🗑 ❌
  },
};

export const iconSymbolsByOrder = {
  1: iconSymbols.sort.asc,
  '-1': iconSymbols.sort.desc,
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
