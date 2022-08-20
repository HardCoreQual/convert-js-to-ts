import ts, {NodeFlags} from 'typescript';
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

            // implement renaming from objectBinding in next createImport
            // @ts-ignore
            return [ts.factory.createImportDeclaration(
              undefined,
              undefined,
              ts.factory.createImportClause(
                false,
                undefined,
                ts.factory.createNamedImports(getChildren(objectBinding as ts.Node).map(child => {
                  // @ts-ignore
                  let propertyName: string | undefined = child.name.kind === ts.SyntaxKind.ObjectBindingPattern || !child.propertyName ? undefined : child.propertyName.escapedText.toString();
                  // @ts-ignore
                  let identifier: string = child.name.kind === ts.SyntaxKind.ObjectBindingPattern ? child.propertyName.escapedText.toString() : child.name.escapedText.toString();

                  return ts.factory.createImportSpecifier(
                    false,
                    // @ts-ignore
                    propertyName && ts.factory.createIdentifier(propertyName),
                    // @ts-ignore
                    ts.factory.createIdentifier(identifier)
                  )
                })),
              ),
              ts.factory.createStringLiteral(requirePath)
            ),
              ...getChildren(objectBinding as ts.Node)
                .filter(child => {

                // @ts-ignore
                return child.propertyName !== undefined && child.name.kind === ts.SyntaxKind.ObjectBindingPattern;
              })
                .map(child => {
                return ts.factory.createVariableDeclarationList(
                    [ts.factory.createVariableDeclaration(
                      // @ts-ignore
                      child.name,
                      undefined,
                      undefined,
                      // @ts-ignore
                      ts.factory.createIdentifier(child.propertyName.escapedText),
                    )],
                  NodeFlags.Const,
                )
              }),
            ];
          }
        }
      }

      return ts.visitEachChild(node, visitor(deep + 1), context);
    };

    return ts.visitNode(sourceFile, visitor(-1));
  };
};
