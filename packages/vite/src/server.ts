import http from "node:http";
import chalk from "chalk";
import path from "node:path";
import mime from "mime-types";
import fs from "node:fs/promises";
import process from "node:process";
import pkg from "../package.json";

const defaultPort = 5173;

export interface ServerOptions {
  host?: boolean;
  port?: number;
}

const defaultOptions: Required<ServerOptions> = {
  port: 5173,
  host: false,
};

// fixme: 1. read large file ?  2. cache resource

export class Server {
  private options: Required<ServerOptions>;

  constructor(options: ServerOptions) {
    this.options = Object.assign(defaultOptions, options);
  }

  createServer = () => {
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
        source = await fs.readFile(path.join(process.cwd(), formattedUrl));
        res.setHeader("Content-Type", mimeType);
        res.end(source);
      } catch (e) {
        notFoundHandler();
      }
    });

    server.listen(this.options.port ?? defaultPort, () => {
      const interval = Date.now() - global.start;
      console.log(
        `${chalk.green(`SVITE v${pkg.version}`)}  ready for ${chalk.cyan(
          `${interval}ms`
        )}`
      );
      console.log(`-> Local:   http://localhost:${this.options.port}`);
    });
    return server;
  };
}
