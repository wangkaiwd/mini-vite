import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import { OutputOptions, RollupOptions } from "rollup";
import path from "path";
import { fileURLToPath } from "node:url";
import pkg from "./package.json" assert { type: "json" };

const external = [...Object.keys(pkg.dependencies)];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createOutput = (isDev: boolean) => {
  const output: OutputOptions[] = [
    {
      file: pkg.module,
      format: "es",
      sourcemap: isDev,
    },
  ];
  if (!isDev) {
    output.push({
      file: pkg.main,
      exports: "named",
      format: "cjs",
      sourcemap: isDev,
    });
  }
  return output;
};

// todo: generate chunk bundle
export default (commandArgs: any): RollupOptions[] => {
  const isDev = !!commandArgs.watch;
  const isProd = !isDev;
  const rollupOptions: RollupOptions[] = [
    {
      input: path.resolve(__dirname, "src/index.ts"),
      external,
      output: createOutput(isDev),
      plugins: [
        // https://github.com/SBoudrias/Inquirer.js/issues/1153#issuecomment-1212827810
        nodeResolve({
          exportConditions: ["node"],
        }),
        commonjs(),
        json(),
        typescript({
          // must specify tsconfig pathname
          tsconfig: path.resolve(__dirname, "tsconfig.node.json"),
          compilerOptions: {
            sourceMap: isDev,
            // https://github.com/Swatinem/rollup-plugin-dts/issues/147
            declarationDir: isDev ? undefined : "./types",
            declaration: isProd,
          },
        }),
      ],
    },
  ];
  if (isProd) {
    rollupOptions.push({
      input: "./dist/types/index.d.ts",
      output: [
        {
          file: "dist/index.d.ts",
          format: "es",
        },
      ],
      plugins: [dts()],
    });
  }
  return rollupOptions;
};
