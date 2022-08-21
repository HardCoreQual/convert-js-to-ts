import * as ts from 'typescript';
import {replaceModuleExportToExportDefaultTransformer} from './replaceModuleExportToExportDefaultTransformer';
import {replaceRequireToImportTransformer} from './replaceRequireToImportTransformer';

export const transform = (projectFiles: ts.SourceFile[]) => ts.transform(projectFiles, [
  replaceModuleExportToExportDefaultTransformer,
  replaceRequireToImportTransformer,
]);
