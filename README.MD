## JavaScript to TypeScript

### Small tool for converting JS to TS using TypeScript Abstract Syntax Tree (AST)


### Usage

```shell
$ npx convert-js-to-ts --projectDir=.  --entrypoint=src/index.js 
```

### Additional possibility

```shell
// For not rewrite initial files
$ npx convert-js-to-ts --projectDir=.  --entrypoint=src/index.js --outputDir=output
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
