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
    timerId = setTimeout(fn, time);
  };
};
