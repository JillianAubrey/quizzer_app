/**
 * Creates a random alphnumeric string of given length. Strings can contain capital and lowercase letters.
 * @param {Number} len The length of the randomized string
 * @return {String} The randomized string
 * */
const generateRandomString = function(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randStr = '';
  for (let i = 0; i < len; i ++) {
    const randNum = randomBetween(0, chars.length - 1);
    randStr += chars[randNum];
  }
  return randStr;
};

/**
 * Returns a random number between min and max, inclusive
 * @param {Number} min The minimum number
 * @param {Number} max The maximum number
 * @return {Number} The random number
 * */
const randomBetween = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

module.exports = { generateRandomString };
