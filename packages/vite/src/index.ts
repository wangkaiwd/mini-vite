import { cac } from "cac";
import { Server, ServerOptions } from "./server";

const cli = cac("svite");
cli
  .command("[root]", "start dev server")
  .option("--host", "display host")
  .option("-p, --port [port]", "specify start server port")
  .action((root: string, options: ServerOptions) => {
    const server = new Server(options);
    server.createServer();
  });

cli.help();

cli.parse();
