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
* replace `require()` with `import`
* replace `module.exports` with `export default`

### In Progress
* split `require` with deep destructing structure on `import` + `destructingConstant`
* if convert original code, use `git mv` instead of `fs.rename`

### License
MIT
