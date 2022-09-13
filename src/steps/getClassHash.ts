import { isString } from "class-validator";
import inquirer from "inquirer";
import * as starknet from "starknet";
import { networkType } from "../types.js";

import { getHashDetails } from "../api.js";
import ora from "ora";

const ui = new inquirer.ui.BottomBar();
const spinner = ora();

function validateHash(input: string): string | boolean {
  if (!isString(input)) {
    return "must be a string";
  }

  if (!starknet.number.isHex(input)) {
    return "must be hex string";
  }

  return true;
}

export async function getClassHash(): Promise<{
  classHash: string;
  networks: networkType[];
}> {
  // get hash from user
  const userInput = await inquirer.prompt({
    type: "input",
    name: "Hash",
    message: "Please enter the deployed Contract Address or Class Hash: ",
    validate(input: string) {
      return validateHash(input);
    },
  });
  spinner.start("Looking for address on Testnet and Mainnet...");

  const userInputHash = userInput.Hash;

  const hashDetailsTestnet = await getHashDetails({
    hash: userInputHash,
    network: "testnet",
  });
  const hashDetailsMainnet = await getHashDetails({
    hash: userInputHash,
    network: "mainnet",
  });

  const choices = [];
  if (hashDetailsTestnet) {
    spinner.succeed("Found address on Testnet");
    choices.push({
      name: "Testnet",
      value: "testnet",
      checked: true,
    });
  }
  if (hashDetailsMainnet) {
    spinner.succeed("Found address on Mainnet");
    choices.push({
      name: "Mainnet",
      value: "mainnet",
      checked: true,
    });
  }

  const classHash =
    hashDetailsTestnet?.class_hash ?? hashDetailsMainnet?.class_hash;
  if (!classHash) {
    spinner.fail("Cannot find address on testnet and mainnet...");
    spinner.stop();
    return await getClassHash();
  }

  spinner.stop();

  // get hash from user
  const userInputRes = await inquirer.prompt({
    type: "checkbox",
    name: "VerifyOnNetworks",
    message: "Select networks to verify",
    choices: choices,
  });
  const userSelectedNetworks = userInputRes.VerifyOnNetworks;

  return {
    classHash: classHash,
    networks: userSelectedNetworks,
  };
}
