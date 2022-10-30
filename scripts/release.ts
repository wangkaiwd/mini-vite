import prompts, { PromptObject } from "prompts";

import { inc, ReleaseType } from "semver";
import { bumpPkgsVersion, getPkgsInfo, step } from "./utils";

const { version: targetVersion } = getPkgsInfo();

const increments: ReleaseType[] = ["major", "minor", "patch"];

const main = async () => {
  const question: PromptObject = {
    type: "select",
    name: "releaseType",
    message: "Pick a new version",
    choices: increments.map((item) => ({
      title: item,
      value: item,
      description: inc(targetVersion, item)!,
    })),
  };
  const { releaseType } = await prompts(question);
  const incVersion = inc(targetVersion, releaseType)!;
  const { confirm } = await prompts({
    type: "confirm",
    name: "confirm",
    message: `New version is ${incVersion}, continue ?`,
    initial: true,
  });
  if (confirm) {
    step("bump packages version ...");
    await bumpPkgsVersion(incVersion);
  }
};

main().catch((err) => {
  console.error(err);
});
