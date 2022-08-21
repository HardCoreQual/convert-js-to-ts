import {ConversionParams, js2ts} from './index';
import { Command } from 'commander';
import { version, description, name } from '../package.json';

const program = new Command();

program
  .name(name)
  .description(description)
  .version(version)
  .option('-p, --projectDir <string>', 'path/to/project')
  .option('-e, --entrypoint <string>', 'path/to/entrypoint/in/project')
  .option('-o, --outputDir <string>', 'path/to/output/dir', '')
  .option('-r, --reconvertTs', 'reconvert exist ts files', false)
  .action((options: ConversionParams) => {
    js2ts(options);
  });

program.parse();
