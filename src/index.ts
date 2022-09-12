import path from "path"
import { SourceCode } from "types";

import verifyClass from "./verifyClass";
import {
  getContractName,
  getRootCairoFile,
  getFileTree,
  getClassHash,
  getStarknetCompilerVersion,
  getIsAccountContract
} from "./steps"

async function main() {
  try {
    const rootCairoFile = await getRootCairoFile();
    const files = await getFileTree(rootCairoFile);
    const { classHash, networks } = await getClassHash();
    const compilerVersion = await getStarknetCompilerVersion();
    const isAccountContract = await getIsAccountContract();
    const contractName = await getContractName({
      defaultName: path.parse(rootCairoFile).name
    });
  
    const sourceCode: SourceCode = {
      root_file_path: path.basename(rootCairoFile),
      class_hash: classHash,
      name: contractName,
      compiler_version: compilerVersion,
      is_account_contract: isAccountContract,
      files: files,
    }
    for (let i = 0; i < networks.length; i++) {
      const network = networks[i]
      try {
        await verifyClass({
          sourceCode: sourceCode,
          network: network
        })
      } catch (err) {
        console.log("[verifyClass] error", err)
      }
  
    }
  } catch (err) {
    console.log(err)
    throw err
  }

}

main();
