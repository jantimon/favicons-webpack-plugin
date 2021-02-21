/**
 * @typedef {{
    attributes: {
      [attributeName: string]: string | boolean;
    };
    tagName: string;
    innerHTML?: string | undefined;
    voidTag: boolean;
    meta: any
  }
  } HtmlTagObject
*/

/**
 * Turn a tag definition into a html string
 * @param {HtmlTagObject} tagDefinition
 *  A tag element according to the htmlWebpackPlugin object notation
 *
 * @param xhtml {boolean}
 *   Wether the generated html should add closing slashes to be xhtml compliant
 */
function htmlTagObjectToString(tagDefinition, xhtml) {
  const attributes = Object.keys(tagDefinition.attributes || {})
    .filter(function(attributeName) {
      return tagDefinition.attributes[attributeName] !== false;
    })
    .map(function(attributeName) {
      if (tagDefinition.attributes[attributeName] === true) {
        return xhtml
          ? attributeName + '="' + attributeName + '"'
          : attributeName;
      }
      return (
        attributeName + '="' + tagDefinition.attributes[attributeName] + '"'
      );
    });
  return (
    '<' +
    [tagDefinition.tagName].concat(attributes).join(' ') +
    (tagDefinition.voidTag && xhtml ? '/' : '') +
    '>' +
    (tagDefinition.innerHTML || '') +
    (tagDefinition.voidTag ? '' : '</' + tagDefinition.tagName + '>')
  );
}

module.exports = { htmlTagObjectToString };
