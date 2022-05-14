const alphabet =
  // eslint-disable-next-line prefer-template
  'abcdefghijklmnopqrstuvwxyz' + 'abcdefghijklmnopqrstuvwxyz'.replace(/./g, (c) => c.toUpperCase());
const numsDict = '0123456789';
const getRandomInt = (maxNum = 100) => Number.parseInt(Math.random() * maxNum, 10);

const getRandomStr = (queryLen = 7, dictionary = alphabet) => {
  const dictionaryLen = dictionary.length;
  let lenIndex = 0;
  let str = '';

  while (lenIndex < queryLen) {
    str += dictionary[getRandomInt(dictionaryLen * 10) % dictionaryLen];
    lenIndex += 1;
  }

  return str;
};
const getRIntLen = (queryLen = 3) => getRandomStr(queryLen, numsDict);

export const generateTestData = (count = 200) => {
  const testData = [];

  for (let i = 0; i < count; i++) {
    testData.push([
      getRandomStr(20),
      getRandomStr(50),
      getRandomInt(10000),
      getRandomInt(2),
      `+${getRIntLen(1)} ${getRIntLen(3)} ${getRIntLen(3)} ${getRIntLen(2)} ${getRIntLen(2)}`,
      // desc: getRandomStr(2) + ' ' + getRandomStr(2) + ' ' + getRandomStr(2) + ' ' + getRandomStr(2) + ' ' + getRandomStr(2) + ' ' + getRandomStr(2) + ' ' + getRandomStr(5),
    ]);
    // book.desc_words = getWords(book.desc)
  }
  return {
    headers: [
      'Name', //
      'Description', //
      'Price',
      'Is modify',
      'Phone Number',
    ],
    data: testData,
  };
};
