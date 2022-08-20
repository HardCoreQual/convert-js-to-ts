## convert JS to TS

### Small tool for converting JS to TS using TypeScript Abstract Syntax Tree (AST)



### Usage

```shell
$ npx convert-js-to-ts --rootDir=src  --entrypoint=index.ts --outputDir=output
## or for convert original code
$ npx convert-js-to-ts --rootDir=src  --entrypoint=index.ts
```

### Features
* rename `.js` to `.ts`
* replace `require()` with `import` (add separate const if require has deep destructuring)
* replace `module.exports` with `export default`

### In Progress
* if convert original code, use `git mv` instead of `fs.rename`
* bug related to remove empty lines
* destruct import if file not use entire module
* after convert to ts, functions call that not receive all available params throw error, because in ts it should declared with `param?: string`

### License
MIT
