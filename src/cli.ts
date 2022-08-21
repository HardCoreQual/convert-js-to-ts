import {ConversionParams, index} from './index';
import { Command } from 'commander';
import { version, description, name } from '../package.json';

const program = new Command();

program
  .name(name)
  .description(description)
  .version(version)
  .option('-p, --projectDir <string>', 'path/to/project')
  .option('-e, --entrypoint <string>', 'path/to/entrypoint/in/project')
  .option('-o, --outputDir <string>', 'path/to/output/dir', '.')
  .action((options: ConversionParams) => {
    index(options);
  });

program.parse();
