/* eslint-disable no-useless-concat */
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

export const THIN_SPACE = '&#8239;';
export const delimiterSymbols = `${THIN_SPACE}/${THIN_SPACE}`;
