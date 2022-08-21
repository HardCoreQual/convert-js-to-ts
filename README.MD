## JavaScript to TypeScript

### Small tool for converting JS to TS using TypeScript Abstract Syntax Tree (AST)


### Basic usage
```shell
$ npx convert-js-to-ts --projectDir=.  --entrypoint=src/index.js 
```

### Documentation
```
Usage: npx convert-js-to-ts [options]

Convert JavaScript Project to TypeScript

Options:
  -V, --version                   output the version number
  -p, --projectDir <string>       path/to/project
  -e, --entrypoint <string>       path/to/entrypoint/in/project ex: src/index.ts
  --outputDir <string|undefined>  path/to/output/dir, by default use projectDir
  --reconvertTs                   reconvert exist ts files (default: false)
  --eslint                        run eslint for converted files (default: false)
  -h, --help                      display help for command
```

### Features
* rename `.js` to `.ts`  (using git)
* replace `require()` with `import`
* replace `module.exports` with `export {}` or `export default`
* run eslint for converted files

### In Progress
* fix bug related to remove comments
* improve import & export conversion
* convert to ts that is ready to compile

### License
MIT
