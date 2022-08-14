import ts from 'typescript';

export const by = (node: ts.Node, type: ts.SyntaxKind, fn: (node: ts.Node) => void) => ts.forEachChild(node, (child) => {
  if (child.kind === type) {
    fn(child);
  }
});
