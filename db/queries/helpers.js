const generateRandomString = function(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randStr = '';
  for (let i = 0; i < len; i ++) {
    const randNum = randomBetween(0, chars.length - 1);
    randStr += chars[randNum];
  }
  return randStr;
};

const randomBetween = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

module.exports = { generateRandomString }
