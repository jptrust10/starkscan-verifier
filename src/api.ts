import axios from "axios"
import { networkType } from "types"

function getHashDetailsUrl({
  hash,
  network,
} : { 
  hash: string,
  network: networkType,
}) {
  if (network === "mainnet") {
    return `https://api.starkscan.co/api/hash/${hash}`
  }

  return `https://api-testnet.starkscan.co/api/hash/${hash}`
}

interface Res {
  type: "class" | "contract",
  class_hash: string,
}
export async function getHashDetails({
  hash,
  network,
} : { 
  hash: string,
  network: networkType,
}): Promise<Res | null> {
  try {
    const url = getHashDetailsUrl({
      hash: hash,
      network: network
    })
    const { data } = await axios.get(url)
    return data;
  } catch (err: any) {
    if (err?.response?.status === 404) {
      // cannot find, expected error
      return null
    } else {
      throw err
    }
  }
}