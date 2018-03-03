'use strict';
const fs = require('fs');
const path = require('path');
const parseAuthor = require('parse-author');

/**
 * Reads file if it exists
 */
function readJSON (file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : undefined;
}

/**
 * Tries to find the package.json and caches its contents
 */
let _pkg;
function readPackageJson (compilerWorkingDirectory) {
  _pkg = _pkg
    || readJSON(path.resolve(compilerWorkingDirectory, 'package.json'))
    || readJSON(path.resolve(compilerWorkingDirectory, '../package.json'))
    || {};

  return _pkg;
}

module.exports = {
/**
 * Tries to guess the name from the package.json
 */
guessAppName (compilerWorkingDirectory) {
  return readPackageJson(compilerWorkingDirectory).name;
},

/**
 * Tries to guess the description from the package.json
 */
guessDescription (compilerWorkingDirectory) {
  return readPackageJson(compilerWorkingDirectory).description;
},

/**
 * Tries to guess the version from the package.json
 */
guessVersion (compilerWorkingDirectory) {
  return readPackageJson(compilerWorkingDirectory).version;
},

/**
 * Tries to guess the author name from the package.json
 */
guessDeveloperName (compilerWorkingDirectory) {
  return parseAuthor(readPackageJson(compilerWorkingDirectory).author || "").name;
},

/**
 * Tries to guess the author URL from the package.json
 */
guessDeveloperURL (compilerWorkingDirectory) {
  return parseAuthor(readPackageJson(compilerWorkingDirectory).author || "").url;
},
};
