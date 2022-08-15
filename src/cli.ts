function readArgs() {
    const args = process.argv.slice(2);

  const argvArr = args.reduce((acc, arg) => {
    if (arg.includes("=")) {
      const [key, value] = arg.split("=");
      acc.push({ key, value });
    } else {
      acc.push({ key: arg, value: args[args.indexOf(arg) + 1] });
      args.splice(args.indexOf(arg) + 1, 1);
    }
    return acc;
  } , [] as { key: string, value: string }[])
  // remove -- form start of key
  .map(({ key, value }) => ({ key: key.replace(/^--/, ""), value }));

  return new Map(argvArr.map(({ key, value }) => [key, value]));
}

export function getArgsByKeys<T extends string, O extends string>(keys: T[], optionalKeys?: O[]): { [K in T]: string } & { [K in O]?: string } {
    const args = readArgs();
    const missingArgs = keys.filter(key => !args.has(key));
    if (missingArgs.length > 0) {
      //  trow error about missing args  where each argument have format --key=value
        throw new Error(`Missing arguments: ${missingArgs.map(key => `--${key}=value`).join(" ")}`);
    }

    const requiredArgs = keys.reduce((acc, key) => {
        acc[key] = args.get(key);
        return acc;
    } , {} as {[key in T]: string});

    const optionalArgs = optionalKeys?.reduce((acc, key) => {
        acc[key] = args.get(key);
        return acc;
    } , {} as {[key in O]: string | undefined});

    return { ...requiredArgs, ...optionalArgs };
}
