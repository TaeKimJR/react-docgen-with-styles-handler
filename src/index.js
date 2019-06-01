const getMemberValuePath = require('react-docgen/dist/utils/getMemberValuePath');
const getDocblock = require('react-docgen/dist/utils/docblock').getDocblock;

function staticWithStylesHandler(documentation, path) {
  const stylesFn = getMemberValuePath(path, 'styles');
  if (!stylesFn) {
    return;
  }

  let classPaths = [];
  if (stylesFn.get('body').node.type === 'BlockStatement') {
    const styleClasses = stylesFn.get(
      'body',
      'body',
      stylesFn.node.body.body.length - 1,
      'argument',
    );
    classPaths = styleClasses.get('properties');
  } else if (stylesFn.get('body').node.type === 'ObjectExpression') {
    classPaths = stylesFn.get('body', 'properties');
  }

  documentation.set(
    'classNames',
    classPaths
      .map(p => {
        return {
          name: p.get('key').node.name,
          docblock: getDocblock(p),
        };
      })
      .filter(Boolean),
  );
}

module.exports = staticWithStylesHandler;
