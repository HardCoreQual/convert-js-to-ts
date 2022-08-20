import ts from 'typescript';
import {getChildren} from './utils';

export const replaceRequireToImportTransformer: ts.TransformerFactory<ts.SourceFile> = context => {
  return sourceFile => {
    const visitor = (deep: number) => (node: ts.Node): ts.Node => {
      // console.log(deep > 0 ? ' '.repeat(deep) : '>>>', node.kind);

      if (node.kind === ts.SyntaxKind.VariableStatement) {

        let requireName = "";
        let objectBinding: null | ts.Node = null;
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
                      });
                    }
                  } else if (child.kind === ts.SyntaxKind.ObjectBindingPattern) {
                    objectBinding = child;
                  }
                });
              }
            });
          }
        });

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
          } else if (objectBinding !== null) {
            let first: any = null;
            let second: any = null;

            (objectBinding as ts.Node).forEachChild(child => {
              // set first and second
              if (first === null) {
                first = child;
              } else if (second === null) {
                second = child;
              }
            });

            (objectBinding as ts.Node).forEachChild(child => {
              // @ts-ignore
              if (child.name.kind === ts.SyntaxKind.ObjectBindingPattern) {
                // @ts-ignore
                child.name = child.propertyName;
                // @ts-ignore
                child.propertyName = undefined;

                // TODO: here is a pair to be deconstructed    {name}  = propertyName
              }
            });

            // implement renaming from objectBinding in next createImport
            return ts.factory.createImportDeclaration(
              undefined,
              undefined,
              ts.factory.createImportClause(
                false,
                undefined,
                ts.factory.createNamedImports(getChildren(objectBinding as ts.Node).map(child => {
                  return ts.factory.createImportSpecifier(
                    false,
                    // @ts-ignore
                    child.propertyName && ts.factory.createIdentifier(child.propertyName.escapedText),
                    // @ts-ignore
                    ts.factory.createIdentifier(child.name.escapedText)
                  )
                  })),
              ),
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
