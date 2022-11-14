import { networkInterfaces } from "node:os";
import process from "node:process";

export const clearScreen = () => process.stdout.write("\x1B[2J");

// https://stackoverflow.com/a/8440736/12819402
export const getIPAddress = () => {
  const nets = networkInterfaces();
  const results: Record<string, any> = {};
  for (const key in nets) {
    const array = nets[key];
    if (array) {
      for (let i = 0; i < array.length; i++) {
        const net = array[i];
        const familyV4Value = "IPv4";
        if (net.family === familyV4Value && !net.internal) {
          if (!results[key]) {
            results[key] = [];
          }
          results[key].push(net.address);
        }
      }
    }
  }
  return results.en7[0];
};
