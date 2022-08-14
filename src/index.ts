
import * as ts from "typescript";
import * as fs from "fs";
import * as path from 'path';

// hardcode our input file
const filePath = "./src/with-require.ts";

// create a program instance, which is a collection of source files
// in this case we only have one source file
const program = ts.createProgram([filePath], {});



const fileNamesWithRequire = program.getSourceFiles().filter(file => file.fileName.includes("with-require"));


const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
  return sourceFile => {
    const visitor = (node: ts.Node): ts.Node => {
      if (ts.isImportDeclaration(node)) {
        return undefined;
      }

      return ts.visitEachChild(node, visitor, context);
    };

    return ts.visitNode(sourceFile, visitor);
  };
};

const result = ts.transform<ts.SourceFile>(fileNamesWithRequire, [transformer])

const printer = ts.createPrinter();

const result2 = printer.printFile(result.transformed[0]);

for (const file of result.transformed) {
  const fullDirName = path.join("build", path.dirname(file.fileName));

  // create the directory if it does not exist recursively
  if (!fs.existsSync(fullDirName)) {
    fs.mkdirSync(fullDirName, { recursive: true });
  }

  fs.writeFileSync(path.join(fullDirName, path.basename(file.fileName)), result2);
}




//
// function applyChanges() {
//   function visitVariableDeclaration(node: ts.Node): ts.Node {
//     const children = node.getChildren();
//
//     children.map((child, index) => {
//       if (child.kind === ts.SyntaxKind.Identifier) {
//
//         children[index] = ts.factory.createIdentifier('hellol');
//       }
//     } );
//
//     return node;
//   }
//
//   function visitor(node: ts.Node): ts.Node {
//     if (node.kind === ts.SyntaxKind.VariableStatement) {
//
//       // let children = node.getChildren();
//
//       // @ts-ignore
//       ts.forEachChild(node, (child, i) => {
//         if (child.kind === ts.SyntaxKind.VariableDeclarationList) {
//           ts.forEachChild(child, grandchild => {
//             if (grandchild.kind === ts.SyntaxKind.VariableDeclaration) {
//
//               // @ts-ignore
//               ts.forEachChild(grandchild, (greatgrandchild, index) => {
//                visitVariableDeclaration(greatgrandchild);
//               } )
//             }
//           } );
//         }
//       } );
//     } else {
//       ts.forEachChild(node, child => {
//         child = visitor(child);
//       } );
//     }
//
//     return node;
//   }
//
//   for (let input of inputFiles) {
//       ts.visitNode(input, visitor) // modifies input's AST
//   }
//
//
//   // program.emit();
//
//
// }
//
//
// applyChanges();
//
// function someOther() {
//   // pull off the typechecker instance from our program
//   const checker = program.getTypeChecker();
//
// // get our models.ts source file AST
//   const source = program.getSourceFile(filePath);
//
//   const a = source?.getText();
//
// // @ts-ignore
//   ts.forEachChild(source, node => {
//     if (node.kind === ts.SyntaxKind.VariableStatement) {
//       console.log( node.getText() );
//
//       ts.forEachChild(node, child => {
//         if (child.kind === ts.SyntaxKind.VariableDeclarationList) {
//           ts.forEachChild(child, grandchild => {
//             if (grandchild.kind === ts.SyntaxKind.VariableDeclaration) {
//               // console.log( grandchild.getText() );
//
//               const children = grandchild.getChildren();
//
//               // source.i
//               //
//               // new ts.Changoe(filePath, 0, "const " + children[0].getText() + " = require(\"" + children[1].getText() + "\");");
//
//               ts.forEachChild(grandchild, greatgrandchild => {
//                 if (greatgrandchild.kind === ts.SyntaxKind.Identifier) {
//                   // @ts-ignore
//                   greatgrandchild = '"hello"';
//                   // ts.visitNode(greatgrandchild, visitor);
//                   // console.log( greatgrandchild.getText() );
//                 }
//
//                 if (greatgrandchild.kind === ts.SyntaxKind.CallExpression) {
//                   // console.log( greatgrandchild.getText() );
//                 }
//               })
//             }
//           })
//         }
//       } );
//     }
//   });
// }


// function visitChildren(node: ts.Node, visitor: ts.Visitor) {
//   for (const prop of possibleChildProperties) {
//     if (node[prop] !== undefined) {
//       if (Array.isArray(node[prop]))
//         node[prop] = node[prop].map(visitor)
//       else
//         node[prop] = visitor(node[prop])
//     }
//   }
//
//   return node
// }
