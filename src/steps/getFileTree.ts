import * as path from "path"
import fs from "fs"
import inquirer from "inquirer"
import { Files } from "types"

const IMPORT_REGEX = /^from\s(.*?)\simport/gm

export class CannotFindFileError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export async function getFileTree(rootFilePath: string): Promise<Files> {
  // default to include path of root file
  const rootFileDirectory = path.dirname(rootFilePath)

  const userInput = await inquirer.prompt(
    {
      type: "input",
      name: "CairoPath",
      message: "Cairo Path: ",
    },
  )
  const searchPath = userInput.CairoPath.trim()
  const searchPaths = [rootFileDirectory, searchPath]
  const files = buildFileTree(path.basename(rootFilePath), searchPaths)
  return files
}


function buildFileTree(filePath: string, searchPaths: string[]) {
  const files: Files = {}
  _buildFileTree(files, filePath, searchPaths);
  return files
}


function _buildFileTree(files: Files, filePath: string, searchPaths: string[]) {
  if (filePath in files) {
    return files;
  }

  const fileValue = getFileContents(filePath, searchPaths)
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
    _buildFileTree(files, convertedFilePath, searchPaths)
  }

  return files;
}

// returns contents of the file
function getFileContents(filePath: string, searchPaths: string[]): string {
  const fileExists = fs.existsSync(filePath)
  if (fileExists) {
    return fs.readFileSync(filePath, "utf-8")
  }

  for (let i = 0; i < searchPaths.length; i++) {
    const searchPath = searchPaths[i]
    const potentialFullFilePath = path.join(searchPath, filePath)
    const fileExists = fs.existsSync(potentialFullFilePath)
    if (fileExists) {
      return fs.readFileSync(potentialFullFilePath, "utf-8")
    }
  }

  throw new CannotFindFileError(`Could not find file: ${filePath}`)
}
