import http from "node:http";
import chalk from "chalk";
import path from "node:path";
import mime from "mime-types";
import fsp from "node:fs/promises";
import process from "node:process";
import fs from "node:fs";
import esbuild from "esbuild";
import pkg from "../package.json";
import { clearScreen, getIPAddress } from "./utils";

const defaultPort = 5173;

export interface ServerOptions {
  host?: boolean;
  port?: number;
}

const defaultOptions: Required<ServerOptions> = {
  port: 5173,
  host: true,
};

const bundleConfigFile = async (filename: string) => {
  const entry = path.basename(filename);
  const tempFilename = `${Date.now()}_${entry}`;
  const buildResult = await esbuild.build({
    entryPoints: [entry],
    write: false,
    outfile: tempFilename,
  });
  return { code: buildResult.outputFiles[0].text };
};

const loadConfigFromBundledFile = async (
  filename: string,
  bundledCode: string
) => {
  const fileBase = `${filename}_${Date.now()}`;
  const fileTmp = `${fileBase}.mjs`;
  await fsp.writeFile(fileTmp, bundledCode);
  const userConfig: ServerOptions = (await import(fileTmp)).default;
  fs.unlinkSync(fileTmp);
  return userConfig;
};

// config source: 1. default config 2. command line config 3. user config file
export const resolveUserConfig = async () => {
  const possibleFilename = ["svite.config.ts", "svite.config.js"];
  let configFilename!: string;
  for (let i = 0; i < possibleFilename.length; i++) {
    const filename = possibleFilename[i];
    const absFilename = path.resolve(process.cwd(), filename);
    if (fs.existsSync(absFilename)) {
      configFilename = absFilename;
      break;
    }
  }
  const bundled = await bundleConfigFile(configFilename);
  return loadConfigFromBundledFile(configFilename, bundled.code);
};

// fixme: 1. read large file ?  2. cache resource
const createServer = async (options: ServerOptions) => {
  const userConfig = await resolveUserConfig();
  options = Object.assign(defaultOptions, options, userConfig);
  const server = http.createServer(async (req, res) => {
    const { url } = req;
    const formattedUrl = url === "/" ? "/index.html" : url;

    function notFoundHandler() {
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end("404 Not Found");
    }

    if (!formattedUrl) {
      notFoundHandler();
      return;
    }
    const extension = path.extname(formattedUrl);
    const mimeType = mime.contentType(extension);
    if (!mimeType) {
      notFoundHandler();
      return;
    }
    let source;
    try {
      source = await fsp.readFile(path.join(process.cwd(), formattedUrl));
      res.setHeader("Content-Type", mimeType);
      res.end(source);
    } catch (e) {
      notFoundHandler();
    }
  });

  const printUrls = () => {
    const interval = Date.now() - global.start;
    console.log(
      `   ${chalk.green(`${chalk.bold("SVITE")} v${pkg.version}`)}  ${chalk.dim(
        `ready in ${chalk.reset(chalk.bold(interval))}`
      )} ms\n`
    );
    console.log(
      chalk.cyan(
        `   ${chalk.green("➜")}  ${chalk.bold(
          "Local"
        )}: http://localhost:${chalk.bold(options.port)}`
      )
    );
    if (options.host) {
      const ip = getIPAddress();
      console.log(
        chalk.cyan(
          `   ${chalk.green("➜")}  ${chalk.bold(
            "Network"
          )}: http://${ip}:${chalk.bold(options.port)}`
        )
      );
    }
  };

  server.listen(options.port ?? defaultPort, () => {
    clearScreen();
    printUrls();
  });
  return server;
};

export default createServer;
