import path from "path";
import inquirer from "inquirer";

import { SourceCode } from "./types.js";
import verifyClass from "./verifyClass.js";
import {
  getContractName,
  getMainCairoFile,
  getFileTree,
  getClassHash,
  getStarknetCompilerVersion,
  getIsAccountContract,
} from "./steps/index.js";

const ui = new inquirer.ui.BottomBar();

async function main() {
  try {
    ui.log.write(
      `\n👋 Hello, Starknet explorer. Welcome to the Contract Verifier ✨\n\n`
    );
    const mainCairoFile = await getMainCairoFile();
    const files = await getFileTree(mainCairoFile);
    const { classHash, networks } = await getClassHash();
    const compilerVersion = await getStarknetCompilerVersion();
    const isAccountContract = await getIsAccountContract();
    const contractName = await getContractName({
      defaultName: path.parse(mainCairoFile).name,
    });

    const sourceCode: SourceCode = {
      main_file_path: path.basename(mainCairoFile),
      class_hash: classHash,
      name: contractName,
      compiler_version: compilerVersion,
      is_account_contract: isAccountContract,
      files: files,
    };

    await verifyClass({
      sourceCode: sourceCode,
      networks: networks,
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

main();
