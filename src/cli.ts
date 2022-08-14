function readArgs() {
    const args = process.argv.slice(2);

    // TODO: seems like it need to regenerate because format --key value not working

    // filter args that not start with --
    // const filteredArgs = args.filter(arg => arg.startsWith("--"));

  //  args ( can have format --key=value  where in one argument has key and value) or (can have format --key value, where key and value are separate)
    const { noValue, withValue }  = args.filter(arg => arg.startsWith("--")).map(arg => {
        const [key, value] = arg.split("=");
        return {
            key: key.replace("--", ""),
            value: value || true,
        };
    } )
      .reduce((acc, { key, value }) => {
        if (typeof value === 'boolean') {
            acc.noValue.push(key);
        } else {
            acc.withValue.push({ key, value });
        }

        return acc;
        // add type for initial value
    } , { noValue: [], withValue: [] } as { noValue: string[], withValue: { key: string, value: string }[] });


    // function for split by chunck with size
  function chunk(arr, size) {
    const chunked_arr = [];
    let i = 0;
    while (i < arr.length) {
      chunked_arr.push(arr.slice(i, i += size));
    }
    return chunked_arr;
  }

    // split noValue by chunks of 2
    const noValueChunks = chunk(noValue, 2);

  // Object.fromEntries for noValueChunks
  const noValueChunksObject = Object.fromEntries(noValueChunks);

  // add noValueChunksObject to withValue
  withValue.push(...Object.entries(noValueChunksObject).map(([key, value]) => ({ key, value })));

  return new Map(withValue.map(({ key, value }) => [key, value]));

}

// getRequiredArgs (by keys if exists return only required keys  else  (throw error where in error message to each missingArgs is added -- from start)) and where keys will be generic type
export function getRequiredArgsByKeys<T extends string>(keys: T[]) {
    const args = readArgs();
    const missingArgs = keys.filter(key => !args.has(key));
    if (missingArgs.length > 0) {
      //  trow error about missing args  where each argument have format --key=value
        throw new Error(`Missing arguments: ${missingArgs.map(key => `--${key}=value`).join(" ")}`);
    }
    return keys.reduce((acc, key) => {
        acc[key] = args.get(key);
        return acc;
    } , {} as {[key in T]: string});
}
