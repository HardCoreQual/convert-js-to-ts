import {ConversionParams, js2ts} from './index';
import { Command, Help } from 'commander';
import { version, description, name } from '../package.json';

const program = new Command();

program
  .name(name)
  .description(description)
  .version(version)
  .option('-p, --projectDir <string>', 'path/to/project')
  .option('-e, --entrypoint <string>', 'path/to/entrypoint/in/project ex: src/index.ts',)
  .option('--outputDir <string|undefined>', 'path/to/output/dir, by default use projectDir', undefined)
  .option('--reconvertTs', 'reconvert exist ts files', false)
  .option('--eslint', 'run eslint for converted files', false)
  .action((options: ConversionParams) => {
    js2ts(options);
  });

// generate documentation for readme

const help = new Help();
help.helpWidth = 30000;
const doc = help.formatHelp(program, help);

program.parse();
