import ts from 'typescript';

export const replaceRequireToImportTransformer: ts.TransformerFactory<ts.SourceFile> = context => {
  return sourceFile => {
    const visitor = (deep: number) => (node: ts.Node): ts.Node => {
      // console.log(deep > 0 ? ' '.repeat(deep) : '>>>', node.kind);

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
