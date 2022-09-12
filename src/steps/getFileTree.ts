import * as path from "path"
import fs from "fs"
import inquirer from "inquirer"
import { Files } from "types"

const IMPORT_REGEX = /^from\s(.*?)\simport/gm
const ui = new inquirer.ui.BottomBar();

export class CannotFindFileError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function getFileTree(rootFilePath: string): Promise<Files> {
  // default to include path of root file
  const rootFileDirectory = path.dirname(rootFilePath)

  const files = await buildFileTree(path.basename(rootFilePath), [rootFileDirectory])
  return files
}


async function buildFileTree(filePath: string, searchPaths: string[]) {
  const files: Files = {}
  await _buildFileTree(files, filePath, searchPaths);
  return files
}


async function _buildFileTree(files: Files, filePath: string, searchPaths: string[]) {
  if (filePath in files) {
    return files;
  }

  const fileValue = await getFileContents(filePath, searchPaths)
  files[filePath] = fileValue
  const importedFilesRegexOutput = [...fileValue.matchAll(IMPORT_REGEX)]
  const importedFilesPath = importedFilesRegexOutput.map(importedFileRegex => {
    return importedFileRegex[1]
  })

  for (let i = 0; i < importedFilesPath.length; i++) {
    const importedFilePath = importedFilesPath[i]
    if (importedFilePath.startsWith("starkware")) {
      // ignore starkware packages, should be included in cairo-lang
      continue
    }
    const convertedFilePath = importedFilePath.split(".").join("/") + ".cairo"
    await _buildFileTree(files, convertedFilePath, searchPaths)
  }

  return files;
}

// returns contents of the file
async function getFileContents(filePath: string, searchPaths: string[]): Promise<string> {
  const fileExists = fs.existsSync(filePath)
  if (fileExists) {
    ui.log.write(`FOUND FILE!: ${filePath}`)
    return fs.readFileSync(filePath, "utf-8")
  }

  for (let i = 0; i < searchPaths.length; i++) {
    const searchPath = searchPaths[i]
    const potentialFullFilePath = path.join(searchPath, filePath)
    const fileExists = fs.existsSync(potentialFullFilePath)
    if (fileExists) {
      ui.log.write(`FOUND FILE!: ${potentialFullFilePath}`)
      return fs.readFileSync(potentialFullFilePath, "utf-8")
    }
  }

  ui.log.write(`cannot find file: ${filePath}`)
  const userInput = await inquirer.prompt(
    {
      // @ts-ignore
      type: "fuzzypath",
      name: "CairoFile",
      message: "Cairo File: ",
      itemType: "file",
      suggestOnly: true,
      excludePath: (nodePath: string) => {
        return (
          // potential python envs
          // nodePath.startsWith("venv") || nodePath.startsWith("env") ||
          // nodePath.startsWith(".venv") || nodePath.startsWith(".env") ||
          // javascript modules
          nodePath.startsWith("node_modules")
        )
      },
      excludeFilter: (nodePath: string) => {
        return !nodePath.endsWith(".cairo")
      },
      // TODO validate
      // validate(input: string) {
      //   return validateRootCairoFile(input)
      // }
    }
  )
  // console.log("AFTER!", userInput)
  // throw new Error("WTF")

  const cairoFile = userInput.CairoFile.trim()
  ui.log.write(`FOUND FILE!: ${cairoFile}`)
  return fs.readFileSync(cairoFile, "utf-8")

  // // return userInput.CairoFile.trim()
  // throw new CannotFindFileError(`Could not find file: ${filePath}`)
}
