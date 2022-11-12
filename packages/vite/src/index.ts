import { cac } from "cac";
import createServer, { ServerOptions } from "./createServer";

const cli = cac("svite");

global.start = Date.now();

cli
  .command("[root]", "start dev server")
  .option("--host", "display host")
  .option("-p, --port [port]", "specify start server port")
  .action(async (root: string, options: ServerOptions) => {
    const server = await createServer(options);
    console.log("server", server);
  });

cli.help();

cli.parse();
