import inquirer from "inquirer"

export async function getIsAccountContract(): Promise<boolean> {
  const userInput = await inquirer.prompt(
    {
      type: "confirm",
      name: "IsAccountContract",
      message: "is this an account contract? ",
    },
  )
  return userInput.IsAccountContract
}
