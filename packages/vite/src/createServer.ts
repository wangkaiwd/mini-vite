import http from "node:http";
import chalk from "chalk";
import path from "node:path";
import mime from "mime-types";
import fsp from "node:fs/promises";
import process from "node:process";
import fs from "node:fs";
import pkg from "../package.json";
import { clearScreen } from "./utils";

const defaultPort = 5173;

export interface ServerOptions {
  host?: boolean;
  port?: number;
}

const defaultOptions: Required<ServerOptions> = {
  port: 5173,
  host: true,
};

// fixme: 1. read large file ?  2. cache resource

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
  return import(configFilename);
};

const createServer = async (options: ServerOptions) => {
  const mergedOptions = Object.assign(defaultOptions, options);
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

  server.listen(mergedOptions.port ?? defaultPort, () => {
    const interval = Date.now() - global.start;
    clearScreen();
    console.log(
      `   ${chalk.green(`${chalk.bold("SVITE")} v${pkg.version}`)}  ${chalk.dim(
        `ready in ${chalk.reset(chalk.bold(interval))}`
      )} ms\n`
    );
    console.log(
      chalk.cyan(
        `   ${chalk.green("➜")}  ${chalk.bold(
          "Local"
        )}: http://localhost:${chalk.bold(mergedOptions.port)}`
      )
    );
  });
  return server;
};

export default createServer;