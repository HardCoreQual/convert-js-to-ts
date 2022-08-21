import ts, {NodeFlags} from 'typescript';
import {by, getChildren} from './utils';

export const replaceModuleExportToExportDefaultTransformer = (context: ts.TransformationContext) => (rootNode: ts.SourceFile) => {
  const visitor = (node: ts.Node): ts.Node => {
    if (node.kind === ts.SyntaxKind.ExpressionStatement) {
      let hasModule = false;
      let hasExport = false;
      let hasOther = false;
      let exportedObject = null as any;

      by(node, ts.SyntaxKind.BinaryExpression, (node) => {
        by(node, ts.SyntaxKind.PropertyAccessExpression, (node) => {
          by(node, ts.SyntaxKind.Identifier, (node) => {
            // @ts-ignore
            if (node.escapedText === 'module') {
              hasModule = true;
              // @ts-ignore
            } else if (node.escapedText === 'exports') {
              hasExport = true;
            } else {
              hasOther = true;
            }
          });
        });


        if (hasModule && hasExport && !hasOther) {
          by(node, [
            ts.SyntaxKind.ObjectLiteralExpression,
            ts.SyntaxKind.Identifier,
            ts.SyntaxKind.ArrowFunction,
            ts.SyntaxKind.FunctionExpression,
            ts.SyntaxKind.ClassExpression,
          ], (node) => {
            exportedObject = node;
          });
        }
      });

      if (hasModule && hasExport && !hasOther && exportedObject) {
        if (exportedObject?.kind !== ts.SyntaxKind.ObjectLiteralExpression) {
          return ts.factory.createExportDefault(exportedObject);
        }

        const children = getChildren(exportedObject);

        // split children into two groups:  with identifiers and without
        const withInitializers = children.filter((child: any) => child.initializer);
        const withoutInitializers = children.filter((child: any) => !child.initializer);

        const declarations = withInitializers.map((child: any) => {
          return ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList([
              ts.factory.createVariableDeclaration(
                child.name,
                undefined,
                undefined,
                child.initializer,
              ),
            ],
            NodeFlags.Const,
          ));
        }  );

        // @ts-ignore
        return [...declarations, ts.factory.createExportDeclaration(
          undefined,
          undefined,
          false,
          // @ts-ignore
          ts.factory.createObjectBindingPattern(children.map((child: any) => child.name)),
          undefined
        )];
      }
    }

    return ts.visitEachChild(node, visitor, context);
  };

  return ts.visitNode(rootNode, (node) => {
    return ts.visitEachChild(node, visitor, context);
  });
}
