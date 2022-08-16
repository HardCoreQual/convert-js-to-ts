import * as ts from "typescript";
import * as fs from "fs";
import * as path from 'path';
import {replaceModuleExportToExportDefaultTransformer, replaceRequireToImportTransformer } from './transformers';
import {getArgsByKeys} from './cli';

const {rootDir, entrypoint, outputDir} = getArgsByKeys(['rootDir', 'entrypoint'], ['outputDir']);
const codeDir = path.relative(process.cwd(), rootDir);

// TODO: resolve paths

let entrypointPath = path.resolve(path.join(codeDir, entrypoint));

if(!fs.existsSync(entrypointPath)) {
  throw new Error(`Entrypoint ${entrypointPath} does not exist`);
}

let program = ts.createProgram([entrypointPath], { allowJs: true });

let files = program.getSourceFiles();

let projectFiles = files
  .filter(file => !file.fileName.includes('node_modules'))
  .filter(file => {
    return path.resolve(file.fileName).includes(path.resolve(codeDir));
  } );

if(projectFiles.length === 0) {
  throw new Error(`No project files found in ${codeDir}, by entrypoint ${entrypointPath}`);
}

projectFiles.forEach(file => {
  const fileContent = fs.readFileSync(file.fileName, 'utf8');
  const newFileContent = fileContent.split('\n').map(line => {
    if (line.trim() === '') {
      return '//  41waZZbs86CZpAGqn2cYnQreZrGaduFZkKFyZp3TNsj55zsINjmpIPxnohl7ZXCWBOVdYw4w9SV6776D3Ro0WXrmObkuQMKsGjlTOLAI32YAmKIje4X8vIovvkAPA60C';
    }
    return line;
  } ).join('\n');

  const relativePath = path.relative(rootDir, file.fileName);

  const outputFileName = path.join(outputDir, relativePath);

  const outputDirName = path.dirname(outputFileName);
  if (!fs.existsSync(outputDirName)) {
    fs.mkdirSync(outputDirName, { recursive: true });
  }

  fs.writeFileSync(outputFileName, newFileContent);
} );

entrypointPath = path.resolve(path.join(outputDir, entrypoint));

if(!fs.existsSync(entrypointPath)) {
  throw new Error(`Converted Entrypoint ${entrypointPath} does not exist`);
}

program = ts.createProgram([entrypointPath], { allowJs: true });
files = program.getSourceFiles();

projectFiles = files
  .filter(file => !file.fileName.includes('node_modules'))
  .filter(file => {
    return path.resolve(file.fileName).includes(path.resolve(outputDir));
  } );

if(projectFiles.length === 0) {
  throw new Error(`Not found converted project files found in ${outputDir}, by entrypoint ${entrypointPath}`);
}


const result = ts.transform<ts.SourceFile>(projectFiles, [
  replaceModuleExportToExportDefaultTransformer,
  replaceRequireToImportTransformer,
])

const printer = ts.createPrinter();


for (const file of result.transformed) {
  const fileContent = printer.printFile(file);

  const newFileContent = fileContent.split('\n').map(line => {
    if (line.trim() === '//  41waZZbs86CZpAGqn2cYnQreZrGaduFZkKFyZp3TNsj55zsINjmpIPxnohl7ZXCWBOVdYw4w9SV6776D3Ro0WXrmObkuQMKsGjlTOLAI32YAmKIje4X8vIovvkAPA60C') {
      return '';
    }
    return line;
  } ).join('\n');

  fs.writeFileSync(file.fileName, newFileContent);
}
