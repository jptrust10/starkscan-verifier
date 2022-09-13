import inquirer from "inquirer";

export async function getIsAccountContract(): Promise<boolean> {
  const userInput = await inquirer.prompt({
    type: "confirm",
    name: "IsAccountContract",
    message: "Is this an Account contract?",
  });
  return userInput.IsAccountContract;
}
