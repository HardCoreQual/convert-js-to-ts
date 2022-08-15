import * as ts from "typescript";
import * as fs from "fs";
import * as path from 'path';
import {replaceModuleExportToExportDefaultTransformer, replaceRequireToImportTransformer } from './transformers';
import {getArgsByKeys} from './cli';

const {rootDir, entrypoint, outputDir} = getArgsByKeys(['rootDir', 'entrypoint'], ['outputDir']);
const codeDir = path.resolve(process.cwd(), rootDir);

const program = ts.createProgram([path.join(rootDir, entrypoint)], { allowJs: true });

const files = program.getSourceFiles();

const projectFiles = files
  .filter(file => {
    return path.resolve(file.fileName).includes(path.resolve(codeDir));
  } );

const result = ts.transform<ts.SourceFile>(projectFiles, [
  replaceModuleExportToExportDefaultTransformer,
  replaceRequireToImportTransformer,
])

const printer = ts.createPrinter();


for (const file of result.transformed) {
  const filePath = file.fileName;
  const filePathRelative = path.relative(process.cwd(), filePath);

  const fullDirName = path.join(outputDir ?? '.', path.dirname(filePathRelative));

  if (!fs.existsSync(fullDirName)) {
    fs.mkdirSync(fullDirName, { recursive: true });
  }

  fs.writeFileSync(path.resolve(path.join(fullDirName, path.basename(filePathRelative))), printer.printFile(file));
}
