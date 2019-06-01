import { visit } from 'ast-types';

function parseDocblock(str) {
  // Does not use \s in the regex as this would match also \n and conflicts
  // with windows line endings.
  return str.replace(/^[ \t]*\*[ \t]?/gm, '').trim();
}

const DOCBLOCK_HEADER = /^\*\s/;

/**
 * Given a path, this function returns the closest preceding docblock if it
 * exists.
 */
export function getDocblock(path, trailing = false) {
  let comments = [];
  if (trailing && path.node.trailingComments) {
    comments = path.node.trailingComments.filter(
      comment =>
        comment.type === 'CommentBlock' && DOCBLOCK_HEADER.test(comment.value),
    );
  } else if (path.node.leadingComments) {
    comments = path.node.leadingComments.filter(
      comment =>
        comment.type === 'CommentBlock' && DOCBLOCK_HEADER.test(comment.value),
    );
  } else if (path.node.comments) {
    comments = path.node.comments.filter(
      comment =>
        comment.leading &&
        comment.type === 'CommentBlock' &&
        DOCBLOCK_HEADER.test(comment.value),
    );
  }

  if (comments.length > 0) {
    return parseDocblock(comments[comments.length - 1].value);
  }
  return null;
}

export default function withStylesHandler(documentation, path) {
  let classPaths = [];

  visit(path, {
    visitCallExpression(p) {
      if (p.node.callee.name === 'withStyles') {
        const stylesFn = p.get('arguments', 0);

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
      }

      this.traverse(p);
    },
  });

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
