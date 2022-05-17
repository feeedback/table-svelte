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
  const parts = expression.split('&');
  const count = parts.length;

  const parsedConditions = parts.map((cond) => parseOneExpression(cond));
  if (count > 1) {
    if (parsedConditions.some((exp) => exp && exp.mark === '=')) {
      return null;
    }
    if (parts.filter((exp) => exp === '').length > 1) {
      return null;
    }
    if (parts.at(-1) === '') {
      return parsedConditions.slice(0, -1);
    }
  }
  if (parsedConditions.includes(null)) {
    return null;
  }
  if (count > 1 && parsedConditions.at(-1).pivotValue === '') {
    return parsedConditions.slice(0, -1);
  }

  return parsedConditions;
};

export const isExpression = (str) => str && /^[>=<]/.test(str);
export const isEmptyExpression = (str) => marks.some((mark) => str === mark);
export const isInvalidExpression = (exp) => parseExpression(exp) === null;
export const isValidExpression = (exp) => isExpression(exp) && !isInvalidExpression(exp);

export const getExpressionCheckFn = (exp) => (queryValue) =>
  exp.every(({ mark, pivotValue }) => mapMarkToFn[mark](pivotValue)(queryValue));

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

export const FILTER_ENUM = {
  NULL: 'NULL',
  STRING: 'STRING',
  EXPRESSION: 'EXPRESSION',
  EMPTY_EXPRESSION: 'EMPTY_EXPRESSION',
  VALID_EXPRESSION: 'VALID_EXPRESSION',
  INVALID_EXPRESSION: 'INVALID_EXPRESSION',
};

export const saveLoadSettingsCache = ({ data, columns, filter, settings }) => {
  const cache = {
    data: localStorage.getItem('table.data'),
    columns: localStorage.getItem('table.columns'),
    settings: localStorage.getItem('table.settings'),
    filter: localStorage.getItem('table.filter'),
  };

  if (!cache.data || !cache.columns) {
    localStorage.setItem('table.data', JSON.stringify(data));
    localStorage.setItem('table.columns', JSON.stringify(columns));
    localStorage.setItem('table.settings', JSON.stringify(settings));
    localStorage.setItem('table.filter', JSON.stringify(filter));
    return { data, columns, filter, settings };
  }

  cache.data = JSON.parse(cache.data);
  cache.columns = JSON.parse(cache.columns);
  cache.settings = cache.settings ? { ...JSON.parse(cache.settings), pageNow: 0 } : settings;
  cache.filter = cache.filter ? JSON.parse(cache.filter) : filter;

  Object.keys(cache.filter.expFnByColumnIdx).forEach((colIdx) => {
    if (cache.filter.state[colIdx] === FILTER_ENUM.VALID_EXPRESSION) {
      cache.filter.expFnByColumnIdx[colIdx] = getExpressionCheckFn(
        parseExpression(cache.filter.rawValueByColumnIdx[colIdx])
      );
    } else if (cache.filter.state[colIdx] === FILTER_ENUM.INVALID_EXPRESSION) {
      cache.filter.state[colIdx] = FILTER_ENUM.NULL;
      cache.filter.rawValueByColumnIdx[colIdx] = null;
      cache.filter.expFnByColumnIdx[colIdx] = null;
    }
  });

  return cache;
};
