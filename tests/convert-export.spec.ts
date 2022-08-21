import ts, {createSourceFile} from 'typescript';
import {transform} from '../src/transformers';


const printer = ts.createPrinter();

describe('module.exports to export or export default', function () {
  it('should convert module.exports to export or export default', function () {
    const sourceFile = createSourceFile('test.js', `
      module.exports = {
        foo: 'bar'
      }
    `, ts.ScriptTarget.ES2015);

    const result = transform([sourceFile]);

    expect(printer.printFile(result.transformed[0])).toBe(`const foo = "bar";
export { foo };
`);
  } );

//   it('should convert module.exports.name = [] to export { name } + name declaration', function () {
//     const abb = `export const name = [];`;
//
//     // @ts-ignore
//     const sourceFile = createSourceFile('unknown-name.ts', abb, {
//
//     });
//
//     const result = js2ts('module.exports.name = []');
//     expect(result).toBe(`
// const name = [];
// export { name };`);
//   });
});
