// eslint-disable-next-line no-nested-ternary
export const compareAB = (prev, next) => (prev < next ? -1 : prev > next ? 1 : 0);

// const sortStr = (arr) => arr.sort(compare);

export const sortStr = (arr) =>
  arr.sort((a, b) => {
    const prev = a.toLowerCase();
    const next = b.toLowerCase();

    return prev === next ? compareAB(b, a) : compareAB(prev, next);
  });

// const sortNum = (arr) => arr.sort((prev, next) => prev - next);

export const sortNum = (arr) => arr.sort(compareAB); // faster

export const createDebounceFn = (time = 200) => {
  let timerId;

  return (fn) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(), time);
  };
};

export const perf = (f, label = 'fn') => {
  const st = performance.now();
  const res = f();

  console.log(`[${label}]`, Math.ceil((performance.now() - st) * 10) / 10, 'ms');

  return res;
};
const cutStrMaxChar = (strRaw, max = 30, isShownCountCut = false) => {
  let str = strRaw;
  if (typeof strRaw === 'object' || typeof strRaw === 'function') {
    if (Array.isArray(strRaw) && strRaw.length > 6) {
      str = strRaw.slice(0, 6);
    }
  }
  str = JSON.stringify(strRaw);
  const { length } = str;
  if (length > max) {
    const countCutChars = new Intl.NumberFormat('ru-RU').format(length - max);
    return isShownCountCut ? `${str.slice(0, max)}… ${countCutChars}` : `${str.slice(0, max)}…`;
  }
  return str;
};

export const wrapFnPerf = (fn, fnName, isLogArgs = true) => {
  const label = (args) => (isLogArgs ? `${fnName} (${args.map((arg) => cutStrMaxChar(arg, 8))})` : `${fnName}`);

  return (...args) => perf(() => fn(...args), label(args));
};
