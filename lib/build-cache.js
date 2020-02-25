const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const cacheFile = path.resolve(__dirname, './build.json');
const existsAsync = promisify(fs.exists);
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const loadCache = async () => {
  if (!(await existsAsync(cacheFile))) {
    return {};
  }

  try {
    const data = await readFileAsync(cacheFile, 'utf-8');
    return JSON.parse(data);
  } catch(error) {
    console.error(error);
    return {};
  }
};

const storeCache = (data = {}) => {
  return writeFileAsync(cacheFile, JSON.stringify(data));
};

module.exports = {
  loadCache,
  storeCache
};