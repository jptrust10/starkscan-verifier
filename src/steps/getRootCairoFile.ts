import { isString } from "class-validator";
import inquirer from "inquirer";

async function validateRootCairoFile(input: any): Promise<string | boolean> {
  const inputValue = input["value"];
  if (!isString(inputValue)) {
    return "must be a string";
  }

  if (!inputValue.endsWith(".cairo")) {
    return "must be a cairo file";
  }

  return true;
}

export async function getRootCairoFile(): Promise<string> {
  // https://github.com/adelsz/inquirer-fuzzy-path
  inquirer.registerPrompt("fuzzypath", require("inquirer-fuzzy-path"));

  const userInput = await inquirer.prompt({
    // @ts-ignore
    type: "fuzzypath",
    name: "RootCairoFile",
    message: "📄 Main Cairo Contract File to Verify:",
    itemType: "file",
    suggestOnly: true,
    excludePath: (nodePath: string) => {
      return (
        // potential python envs
        nodePath.startsWith("venv") ||
        nodePath.startsWith("env") ||
        nodePath.startsWith(".venv") ||
        nodePath.startsWith(".env") ||
        // javascript modules
        nodePath.startsWith("node_modules")
      );
    },
    excludeFilter: (nodePath: string) => {
      return !nodePath.endsWith(".cairo");
    },
    // TODO jkoh
    // validate(input: string) {
    //   return validateRootCairoFile(input);
    // },
  });
  return userInput.RootCairoFile.trim();
}
