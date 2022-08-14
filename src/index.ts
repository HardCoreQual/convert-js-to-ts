
import * as ts from "typescript";
import * as fs from "fs";
import * as path from 'path';

const rootDir = './src/';

const codeDir = path.resolve(process.cwd(), rootDir);


const program = ts.createProgram(['src/testing_data/index.js'], { allowJs: true });

const files = program.getSourceFiles();

const filesNames = files.map(file => file.fileName);

const projectFiles = files
  .filter(file => {
    return path.resolve(file.fileName).includes(path.resolve(codeDir));
} );

// TODO: split object destructuring if it has deep level

const transformer: ts.TransformerFactory<ts.SourceFile> = context => {
  return sourceFile => {
    const visitor = (node: ts.Node): ts.Node => {
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

      return ts.visitEachChild(node, visitor, context);
    };

    return ts.visitNode(sourceFile, visitor);
  };
};

const result = ts.transform<ts.SourceFile>(projectFiles, [transformer])

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
