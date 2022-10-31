import { cac } from "cac";

const cli = cac("xxx");
cli
  .command("rm <dir>", "Remove a dir")
  .option("-r, --recursive", "Remove recursively")
  .action((dir, options) => {
    console.log(`remove ${dir}${options.recursive ? " recursively" : ""}`);
  });

cli.help();

cli.parse();
