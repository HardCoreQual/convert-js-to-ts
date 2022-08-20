## JavaScript to TypeScript

### Small tool for converting JS to TS using TypeScript Abstract Syntax Tree (AST)


### Usage

```shell
$ npx convert-js-to-ts --rootDir=src  --entrypoint=index.js
```

### Additional possibility

```shell
// For not rewrite initial files
$ npx convert-js-to-ts --rootDir=src  --entrypoint=index.js --outputDir=output
```

### Features
* rename `.js` to `.ts`  (save renaming in git for case with change exist files)
* replace `require()` with `import` (add separate const if require has deep destructuring)
* replace `module.exports` with `export default`

### In Progress
* improve import & export
* convert to ts that is ready to compile

### License
MIT
