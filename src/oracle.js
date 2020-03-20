const path = require('path');
const findRoot = require('find-root');
const parseAuthor = require('parse-author');

module.exports = class Oracle {
  constructor(context) {
    try {
      this.pkg = require(path.join(findRoot(context), 'package.json'));
    } catch (_) {
      this.pkg = {};
    }
  }

  /**
   * Tries to guess the name from package.json
   */
  guessAppName() {
    return this.pkg.name;
  }

  /**
   * Tries to guess the description from package.json
   */
  guessDescription() {
    return this.pkg.description;
  }

  /**
   * Tries to guess the version from package.json
   */
  guessVersion() {
    return this.pkg.version;
  }

  /**
   * Tries to guess the developer {name, email, url} from package.json
   */
  guessDeveloper() {
    return typeof this.pkg.author === 'string'
      ? parseAuthor(this.pkg.author)
      : typeof this.pkg.author === 'object' && this.pkg.author
      ? {
          name: this.pkg.author.name,
          email: this.pkg.author.email,
          url: this.pkg.author.url
        }
      : {};
  }

  /**
   * Tries to guess the developer name from package.json
   */
  guessDeveloperName() {
    return this.guessDeveloper().name;
  }

  /**
   * Tries to guess the developer URL from package.json
   */
  guessDeveloperURL() {
    return this.guessDeveloper().url;
  }
};
