/* eslint-disable eqeqeq */

export const CHAR_STARS_WITH = '^';

export const MAP_MARK_TO_FN = {
  '>=': (pivot) => (x) => Number(x) >= Number(pivot),
  '>': (pivot) => (x) => Number(x) > Number(pivot),
  '<=': (pivot) => (x) => Number(x) <= Number(pivot),
  '<': (pivot) => (x) => Number(x) < Number(pivot),
  '=': (pivot) => (x) => x == pivot,
  '!': (pivot) => (x) => x != pivot,
  '!~': (pivot) => (x) => !`${x}`.includes(pivot),
  '!-': () => (x) => !x,
  '!+': () => (x) => x,
  '!=': (pivot) => (x) => x != pivot,
};
export const MARKS_SET = new Set(Object.keys(MAP_MARK_TO_FN));
const MARKS = [...MARKS_SET].sort((a, b) => b.length - a.length);

export const isMathMark = (str) => str && /^[><]/.test(str);
export const isValidMathExpression = (pivotValue) => !Number.isNaN(Number(pivotValue));
export const isExpression = (str) => str && /^[~!+->=<]/.test(str);
export const isEmptyExpression = (str) => MARKS.some((mark) => str === mark && mark !== '!-' && mark !== '!+');

export const parseOneExpression = (expression) => {
  const indexMarkEnd = MARKS.find((mark) => expression.startsWith(mark))?.length;

  if (!indexMarkEnd) {
    return null;
  }
  const mark = expression.slice(0, indexMarkEnd).trim();
  const pivotValue = expression.slice(indexMarkEnd).trim();

  if (mark === '!-' || mark === '!+') {
    if (pivotValue === '') {
      return { mark, pivotValue: 'x' };
    }
    return null;
  }

  if (pivotValue === '') {
    return { mark, pivotValue: '' };
  }

  if (isMathMark(mark) && !isValidMathExpression(pivotValue)) {
    return null;
  }
  return { mark, pivotValue };
};

export const parseExpression = (expressionRaw) => {
  const expression = expressionRaw;
  const parts = expression.split('&').map((exp) => exp.trim());
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

export const isInvalidExpression = (exp) => parseExpression(exp) === null;
export const isValidExpression = (exp) => isExpression(exp) && !isInvalidExpression(exp);

export const getExpressionCheckFn = (exp) => (queryValue) =>
  exp.every(({ mark, pivotValue }) => MAP_MARK_TO_FN[mark](pivotValue)(queryValue));

export const highlightQueryInFiltered = (queryValueRaw, value) => {
  if (queryValueRaw === null || !queryValueRaw || isExpression(queryValueRaw)) {
    return value;
  }

  const queryValue = queryValueRaw[0] === CHAR_STARS_WITH ? queryValueRaw.slice(1) : queryValueRaw;
  const queryValueStr = String(queryValue).toLowerCase();
  const queryLen = queryValue.length;

  const strValue = String(value);
  const queryStart = strValue.toLowerCase().indexOf(queryValueStr);
  const queryEnd = queryStart + queryLen;

  return [strValue.slice(0, queryStart), '<mark>', strValue.slice(queryStart, queryEnd), '</mark>', strValue.slice(queryEnd)].join('');
};

export const FILTER_ENUM = {
  NULL: 'NULL',
  STRING: 'STRING',
  EXPRESSION: 'EXPRESSION',
  EMPTY_EXPRESSION: 'EMPTY_EXPRESSION',
  VALID_EXPRESSION: 'VALID_EXPRESSION',
  INVALID_EXPRESSION: 'INVALID_EXPRESSION',
};

export const saveLoadSettingsCache = (
  { columns, hiddenColumns, sortedBy, sortOrder, filter, filterInputBindValues },
  cachePrefix = 'table'
) => {
  if (columns.length === 0) {
    return {
      hiddenColumns,
      sort: { sortedBy, sortOrder },
      filter,
      filterInputBindValues,
    };
  }
  const oldColumns = localStorage.getItem(`${cachePrefix}.columns`);

  if (JSON.stringify(columns) !== oldColumns) {
    localStorage.setItem(`${cachePrefix}.columns`, JSON.stringify(columns));
    localStorage.setItem(`${cachePrefix}.hiddenColumns`, JSON.stringify(hiddenColumns));
    localStorage.setItem(`${cachePrefix}.sort`, JSON.stringify({ sortedBy, sortOrder }));
    localStorage.setItem(`${cachePrefix}.filter`, JSON.stringify(filter));
    localStorage.setItem(`${cachePrefix}.filterInputBindValues`, JSON.stringify(filterInputBindValues));

    return { hiddenColumns, sort: { sortedBy, sortOrder }, filter, filterInputBindValues };
  }

  const rawCache = {
    hiddenColumns: localStorage.getItem(`${cachePrefix}.hiddenColumns`),
    sort: localStorage.getItem(`${cachePrefix}.sort`),
    filter: localStorage.getItem(`${cachePrefix}.filter`),
    filterInputBindValues: localStorage.getItem(`${cachePrefix}.filterInputBindValues`),
  };

  if (!rawCache.hiddenColumns) {
    localStorage.setItem(`${cachePrefix}.hiddenColumns`, JSON.stringify(hiddenColumns));
    localStorage.setItem(`${cachePrefix}.sort`, JSON.stringify({ sortedBy, sortOrder }));
    localStorage.setItem(`${cachePrefix}.filter`, JSON.stringify(filter));
    localStorage.setItem(`${cachePrefix}.filterInputBindValues`, JSON.stringify(filterInputBindValues));

    return { hiddenColumns, sort: { sortedBy, sortOrder }, filter, filterInputBindValues };
  }

  const cache = {
    hiddenColumns: JSON.parse(rawCache.hiddenColumns),
    sort: JSON.parse(rawCache.sort),

    filter: rawCache.filter ? JSON.parse(rawCache.filter) : filter,
    filterInputBindValues: rawCache.filterInputBindValues ? JSON.parse(rawCache.filterInputBindValues) : filterInputBindValues,
  };

  Object.keys(cache.filter.expFnByColumnIdx).forEach((colIdx) => {
    if (cache.filter.state[colIdx] === FILTER_ENUM.VALID_EXPRESSION) {
      cache.filter.expFnByColumnIdx[colIdx] = getExpressionCheckFn(parseExpression(cache.filter.rawValueByColumnIdx[colIdx]));
    } else if (cache.filter.state[colIdx] === FILTER_ENUM.INVALID_EXPRESSION) {
      cache.filter.state[colIdx] = FILTER_ENUM.NULL;
      cache.filter.rawValueByColumnIdx[colIdx] = null;
      cache.filter.expFnByColumnIdx[colIdx] = null;
    }
  });

  return cache;
};
