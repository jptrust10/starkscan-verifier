import { isString } from "class-validator"
import inquirer from "inquirer"
import * as starknet from "starknet"
import { networkType } from "types";

import { getHashDetails } from "../api"

const ui = new inquirer.ui.BottomBar();


function validateHash(input: string): string | boolean {
  if (!isString(input)) {
    return "must be a string"
  }

  if (!starknet.number.isHex(input)) {
    return "must be hex string"
  }

  return true;
}


export async function getClassHash(): Promise<{
  classHash: string,
  networks: networkType[],
}> {
  // get hash from user
  const userInput = await inquirer.prompt(
    {
      type: "input",
      name: "Hash",
      message: "Contract Address / Class Hash: ",
      validate(input: string) {
        return validateHash(input)
      },
    },
  )
  const userInputHash = userInput.Hash

  const hashDetailsTestnet = await getHashDetails({
    hash: userInputHash,
    network: "testnet"
  })
  const hashDetailsMainnet = await getHashDetails({
    hash: userInputHash,
    network: "mainnet"
  })


  const choices = []
  if (hashDetailsTestnet) {
    choices.push({
      name: "testnet",
      value: "testnet",
      checked: true,
    })
  }
  if (hashDetailsMainnet) {
    choices.push({
      name: "mainnet",
      value: "mainnet",
      checked: true,
    })
  }

  const classHash = hashDetailsTestnet?.class_hash ?? hashDetailsMainnet?.class_hash
  if (!classHash) {
    ui.log.write("cannot find hash on testnet and mainnet...")
    return await getClassHash()
  }

  // get hash from user
  const userInput2 = await inquirer.prompt(
    {
      type: "checkbox",
      name: "VerifyOnNetworks",
      message: "Select networks to verify",
      choices: choices,
    },
  )
  const userSelectedNetworks = userInput2.VerifyOnNetworks


  return {
    classHash: classHash,
    networks: userSelectedNetworks
  }
}
