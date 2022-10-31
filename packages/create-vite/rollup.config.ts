import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { OutputOptions, RollupOptions } from "rollup";
import path from "path";
import { fileURLToPath } from "node:url";
import pkg from "./package.json" assert { type: "json" };

const external = [...Object.keys(pkg.devDependencies)];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createOutput = (isDev: boolean) => {
  const output: OutputOptions[] = [
    {
      file: pkg.main,
      format: "es",
      sourcemap: isDev,
    },
  ];
  return output;
};

export default (commandArgs: any): RollupOptions[] => {
  const isDev = !!commandArgs.watch;
  const rollupOptions: RollupOptions[] = [
    {
      input: path.resolve(__dirname, "src/index.ts"),
      external,
      output: createOutput(isDev),
      plugins: [
        nodeResolve(),
        commonjs(),
        json(),
        typescript({
          // must specify tsconfig pathname
          tsconfig: path.resolve(__dirname, "tsconfig.node.json"),
        }),
      ],
    },
  ];
  return rollupOptions;
};
