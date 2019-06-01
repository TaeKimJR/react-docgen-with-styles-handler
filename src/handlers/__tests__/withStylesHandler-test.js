jest.mock('../../Documentation');

import { parse } from '../../../tests/utils';

describe('withStylesHandler', () => {
  let documentation;
  let withStylesHandler;

  beforeEach(() => {
    documentation = new (require('../../Documentation'))();
    withStylesHandler = require('../withStylesHandler').default;
  });

  function test(definition) {
    withStylesHandler(documentation, definition);
    expect(documentation.classNames).toEqual([
      {
        name: 'foo',
        docblock: 'The foo class',
      },
      {
        name: 'bar',
        docblock: 'The bar class',
      },
      {
        name: 'zar',
        docblock: 'The zar class',
      },
    ]);
  }

  it('extracts the documentation for a style arrow function', () => {
    const src = `
      const Button = () => <div>Hello World</div>;
      Button.styles = () => ({
        /**
         * The foo class
         */
        foo: {
          background: 'red',
        },
        /**
         * The bar class
         */
        bar: {
          background: 'red',
        },
        /**
         * The zar class
         */
        zar: {
          background: 'red',
        }
      });
    `;
    test(parse(src).get('body', 0));
  });
});
