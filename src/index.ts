import * as ts from "typescript";
import * as fs from "fs";
import * as path from 'path';

const rootDir = 'src';

const entrypoint = path.join('testing_data', 'index.js');

const codeDir = path.resolve(process.cwd(), rootDir);


const program = ts.createProgram([path.join(rootDir, entrypoint)], { allowJs: true });

const files = program.getSourceFiles();

const filesNames = files.map(file => file.fileName);

const projectFiles = files
  .filter(file => {
    return path.resolve(file.fileName).includes(path.resolve(codeDir));
} )
// fileName include entrypoint
  .filter(
    file => {
      return file.fileName.includes(entrypoint);
    }
  )

// TODO: split object destructuring if it has deep level

declare module "typescript" {
  interface Node {
    escapedText?: any;
  }
}


const by = (node: ts.Node, type: ts.SyntaxKind, fn: (node: ts.Node) => void) => ts.forEachChild(node, (child) => {
  if (child.kind === type) {
    fn(child);
  }
} );

const replaceModuleExportToExportDefaultTransformer = (context: ts.TransformationContext) => (rootNode: ts.SourceFile) => {
  const visitor = (node: ts.Node): ts.Node => {
    if (node.kind === ts.SyntaxKind.ExpressionStatement) {
      let hasModule = false;
      let hasExport = false;
      let hasOther = false;
      let exportedObject = null;

      by(node, ts.SyntaxKind.BinaryExpression, (node) => {
        by(node, ts.SyntaxKind.PropertyAccessExpression, (node) => {
          by(node, ts.SyntaxKind.Identifier, (node) => {
            if (node.escapedText === 'module') {
              hasModule = true;
            } else if (node.escapedText === 'exports') {
              hasExport = true;
            } else {
              hasOther = true;
            }
          } );
        } );


        if (hasModule && hasExport && !hasOther) {
          by(node, ts.SyntaxKind.ObjectLiteralExpression, (node) => {
            exportedObject = node;
          } );
          by(node, ts.SyntaxKind.Identifier, (node) => {
            exportedObject = node;
          } );
        }
      } );

      if (hasModule && hasExport && !hasOther && exportedObject) {
        return ts.factory.createExportDefault(exportedObject);
      }
    }

    return ts.visitEachChild(node, visitor, context);
  };

  return ts.visitNode(rootNode, (node) => {
    return ts.visitEachChild(node, visitor, context);
  });
}


const replaceRequireToImportTransformer: ts.TransformerFactory<ts.SourceFile> = context => {
  return sourceFile => {
    const visitor = (deep: number) => (node: ts.Node): ts.Node => {
      console.log( deep > 0 ? ' '.repeat(deep) : '>>>', node.kind );

      if (node.kind === ts.SyntaxKind.VariableStatement) {

        let requireName = "";
        let objectBinding = null;
        let requirePath = "";

        node.forEachChild(child => {
          if (child.kind === ts.SyntaxKind.VariableDeclarationList) {
            child.forEachChild(child => {
              if (child.kind === ts.SyntaxKind.VariableDeclaration) {
                child.forEachChild(child => {
                  if (child.kind === ts.SyntaxKind.Identifier) {
                    // @ts-ignore
                    if (child.escapedText) {
                      // @ts-ignore
                      requireName = child.escapedText?.toString();
                    }
                  } else if (child.kind === ts.SyntaxKind.CallExpression) {
                    // @ts-ignore
                    if (child.expression.escapedText?.toString() === "require") {
                      child.forEachChild(child => {
                        if (child.kind === ts.SyntaxKind.StringLiteral) {
                          // @ts-ignore
                          requirePath = child.text;
                        }
                      } );
                    }
                  } else if (child.kind === ts.SyntaxKind.ObjectBindingPattern) {
                    objectBinding = child;
                  }
                } );
                }
              }   );
            }
          } );

        if (requirePath) {
          if (requireName) {
            return ts.factory.createImportDeclaration(
              undefined,
              undefined,
              ts.factory.createImportClause(
                false,
                ts.factory.createIdentifier(requireName),
                undefined
              ),
              ts.factory.createStringLiteral(requirePath)
            );
          } else if (objectBinding) {
            return ts.factory.createImportDeclaration(
              undefined,
              undefined,
              objectBinding,
              ts.factory.createStringLiteral(requirePath)
            );
          }
        }

      }

      return ts.visitEachChild(node, visitor(deep + 1), context);
    };

    return ts.visitNode(sourceFile, visitor(-1));
  };
};

const result = ts.transform<ts.SourceFile>(projectFiles, [
  replaceModuleExportToExportDefaultTransformer,
  replaceRequireToImportTransformer,
])

const printer = ts.createPrinter();


for (const file of result.transformed) {
  const filePath = file.fileName;
  const filePathRelative = path.relative(process.cwd(), filePath);

  const fullDirName = path.join("output", path.dirname(filePathRelative));

  if (!fs.existsSync(fullDirName)) {
    fs.mkdirSync(fullDirName, { recursive: true });
  }

  fs.writeFileSync(path.join(fullDirName, path.basename(filePathRelative)), printer.printFile(file));
}
