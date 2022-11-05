import process from "node:process";

export const clearScreen = () => process.stdout.write("\x1B[2J");
