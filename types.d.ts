import ts from 'typescript';

declare module "typescript" {
  interface Node {
    escapedText?: any;
  }
}
