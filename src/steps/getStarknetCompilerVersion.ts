import inquirer from "inquirer"

export async function getStarknetCompilerVersion(): Promise<string> {
  inquirer.registerPrompt("search-list", require("inquirer-search-list"));

  const userInput = await inquirer.prompt(
    {
      // @ts-ignore
      type: "search-list",
      name: "StarknetCompilerVersion",
      message: "Compiler version:",
      choices: [
        "0.10.0",
        "0.9.1",
        "0.9.0",
        "0.8.2",
        "0.8.1",
        "0.8.0"
      ]
    },
  )
  return userInput.StarknetCompilerVersion
}
