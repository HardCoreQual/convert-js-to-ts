import util from 'util';
import child_process from 'child_process';
import path from 'path';
import process from 'process';
import fs from 'fs';
import * as ts from 'typescript';
import {transform} from './transformers';

const exec = util.promisify(child_process.exec);
export type ConversionParams = {
  projectDir: string;
  outputDir: string;
  entrypoint: string;
  reconvertTs: boolean;
}

export function js2ts({projectDir, outputDir: receivedOutputDir, entrypoint, reconvertTs}: ConversionParams) {
  const outputDir = receivedOutputDir || projectDir;
  const codeDir = path.resolve(projectDir);

  let entrypointPath = path.resolve(path.join(codeDir, entrypoint));

  if (!fs.existsSync(entrypointPath)) {
    throw new Error(`Entrypoint ${entrypointPath} does not exist`);
  }

  let program = ts.createProgram([entrypointPath], {allowJs: true});

  let files = program.getSourceFiles();

  function filterFiles(files: Readonly<ts.SourceFile[]>, dir: string) {
    return files
      .filter(({fileName}) => {
        if (fileName.includes('node_modules')) {
          return false;
        }
        if (fileName.endsWith('.js')) {
          return true;
        }

        return fileName.endsWith('.ts') && reconvertTs;
      })
      .filter(file => {
        return path.resolve(file.fileName).includes(path.resolve(dir));
      });
  }

  let projectFiles = filterFiles(files, codeDir);

  if (projectFiles.length === 0) {
    throw new Error(`No project files found in ${codeDir}, by entrypoint ${entrypointPath}`);
  }

  const emptyLineComment = '//  41waZZbs86CZpAGqn2cYnQreZrGaduFZkKFyZp3TNsj55zsINjmpIPxnohl7ZXCWBOVdYw4w9SV6776D3Ro0WXrmObkuQMKsGjlTOLAI32YAmKIje4X8vIovvkAPA60C';

  projectFiles.forEach(file => {
    const fileContent = fs.readFileSync(file.fileName, 'utf8');
    const newFileContentArr = fileContent.split('\n');

    const newFileContent = newFileContentArr.map(line => {
      if (line.trim() === '') {
        return emptyLineComment;
      }
      return line;
    }).join('\n');

    const relativePath = path.relative(projectDir, file.fileName);

    const outputFileName = path.join(outputDir, relativePath);

    const outputDirName = path.dirname(outputFileName);
    if (!fs.existsSync(outputDirName)) {
      fs.mkdirSync(outputDirName, {recursive: true});
    }

    fs.writeFileSync(outputFileName, newFileContent);
  });

  entrypointPath = path.resolve(path.join(outputDir, entrypoint));

  if (!fs.existsSync(entrypointPath)) {
    throw new Error(`Converted Entrypoint ${entrypointPath} does not exist`);
  }

  program = ts.createProgram([entrypointPath], {allowJs: true});
  files = program.getSourceFiles();

  projectFiles = filterFiles(files, outputDir);

  if (projectFiles.length === 0) {
    throw new Error(`Not found converted project files found in ${outputDir}, by entrypoint ${entrypointPath}`);
  }


  const result = transform(projectFiles);
  const printer = ts.createPrinter();

  if (result.transformed.length === 0) {
    throw new Error(`No transformed files found`);
  }

  Promise.all(result.transformed.map(async (file) => {
    const fileContent = printer.printFile(file);

    const newFileContent = fileContent.split('\n').map(line => {
      if (line.trim() === '//  41waZZbs86CZpAGqn2cYnQreZrGaduFZkKFyZp3TNsj55zsINjmpIPxnohl7ZXCWBOVdYw4w9SV6776D3Ro0WXrmObkuQMKsGjlTOLAI32YAmKIje4X8vIovvkAPA60C') {
        return '';
      }
      return line;
    }).join('\n');

    const directoryPath = path.dirname(file.fileName);
    const basename = path.basename(file.fileName);

    const fullBaseName = path.join(directoryPath, basename);

    fs.writeFileSync(fullBaseName, newFileContent);

    if (fullBaseName.endsWith('.js')) {
      const newFullFileName = fullBaseName.slice(0, -'js'.length) + 'ts';
      const gitMvCommand = `git mv ${fullBaseName} ${newFullFileName}`;
      await exec(gitMvCommand, {cwd: projectDir});

      return newFullFileName;
    }

    return fullBaseName;
  }))
    .then(files => {
      const eslintCommand = `npx eslint --fix ${files.join(' ')}`;
      return exec(eslintCommand, {cwd: projectDir}).catch((e) => {
        console.log(e)
      });
    })
    .then(() => {
      console.log('Project is convert to TypeScript');
    });
}
