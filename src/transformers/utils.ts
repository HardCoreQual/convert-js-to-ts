import ts from 'typescript';

export const by = (node: ts.Node, type: ts.SyntaxKind | ts.SyntaxKind[], fn: (node: ts.Node) => void) => ts.forEachChild(node, (child) => {
  if (child.kind === type || type instanceof Array && type.includes(child.kind)) {
    fn(child);
  }
});


export const getChildren = (node: ts.Node) => {
  const children = [] as ts.Node[];
  ts.forEachChild(node, (child) => {
    children.push(child);
  })
  return children;
}
