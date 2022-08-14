import ts from 'typescript';
import {by} from './utils';

export const replaceModuleExportToExportDefaultTransformer = (context: ts.TransformationContext) => (rootNode: ts.SourceFile) => {
  const visitor = (node: ts.Node): ts.Node => {
    if (node.kind === ts.SyntaxKind.ExpressionStatement) {
      let hasModule = false;
      let hasExport = false;
      let hasOther = false;
      let exportedObject = null;

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
          by(node, ts.SyntaxKind.ObjectLiteralExpression, (node) => {
            exportedObject = node;
          });
          by(node, ts.SyntaxKind.Identifier, (node) => {
            exportedObject = node;
          });
        }
      });

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
