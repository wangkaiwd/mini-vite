import http from "node:http";
import chalk from "chalk";

const defaultPort = 5173;

export interface ServerOptions {
  host?: boolean;
  port?: string | number;
}

export class Server {
  private options: ServerOptions;

  constructor(options: ServerOptions) {
    this.options = options;
  }

  createServer() {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          data: "Hello World!",
        })
      );
    });

    server.listen(this.options.port ?? defaultPort, () => {
      console.log(chalk.dim(`-> Local: http://localhost:${this.options.port}`));
    });
    return server;
  }
}
