import { SourceCode, networkType } from "types";
import axios from "axios"
import { waitFor } from "./utils";


async function getJobStatus({
  jobId,
  network,
} : {
  jobId: string,
  network: networkType,
}) {
  let url = `https://api-testnet.starkscan.co/api/verify_class_job_status/${jobId}`
  if (network === "mainnet") {
    url = `https://api.starkscan.co/api/verify_class_job_status/${jobId}`
  }

  const { data } = await axios.get(url)
  return data
}

function getVerificationUrl(network: networkType) {
  if (network === "testnet") {
    return "https://api-testnet.starkscan.co/api/verify_class"
  }
  return "https://api.starkscan.co/api/verify_class"
}


async function verifyClass({
  sourceCode,
  network,
} : {
  sourceCode: SourceCode,
  network: networkType,
}) {
  const verificationUrl = getVerificationUrl(network)
  const { data } = await axios.post(verificationUrl, sourceCode)
  const jobId = data.job_id

  while (true) {
    const jobStatus = await getJobStatus({
      jobId: jobId,
      network: network,
    })
    console.log(jobStatus)
    await waitFor(3000)
  }
}

export default verifyClass
