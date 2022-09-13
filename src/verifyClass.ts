import { SourceCode, networkType } from "./types.js";
import axios from "axios";
import { waitFor } from "./utils.js";
import { getStarkscanClassUrl, JobStatusRes } from "./api.js";

async function getJobStatus({
  jobId,
  network,
}: {
  jobId: string;
  network: networkType;
}) {
  let url = `https://api-testnet.starkscan.co/api/verify_class_job_status/${jobId}`;
  if (network === "mainnet") {
    url = `https://api.starkscan.co/api/verify_class_job_status/${jobId}`;
  }

  const { data } = await axios.default.get(url);
  return data;
}

function getVerificationUrl(network: networkType) {
  if (network === "testnet") {
    return "https://api-testnet.starkscan.co/api/verify_class";
  }
  return "https://api.starkscan.co/api/verify_class";
}

async function verifyClassOnNetwork({
  sourceCode,
  network,
}: {
  sourceCode: SourceCode;
  network: networkType;
}): Promise<JobStatusRes> {
  const verificationUrl = getVerificationUrl(network);
  const { data } = await axios.default.post(verificationUrl, sourceCode);
  const jobId = data.job_id;

  while (true) {
    const jobStatus = await getJobStatus({
      jobId: jobId,
      network: network,
    });

    if (jobStatus.status === "SUCCESS" || jobStatus.status === "FAILED") {
      console.log(
        "starkscan url: ",
        getStarkscanClassUrl({
          classHash: jobStatus.class_hash,
          network: network,
        })
      );
      return jobStatus;
    }

    console.log(network, jobStatus);
    await waitFor(3000);
  }
}

// verify class on given networks
async function verifyClass({
  sourceCode,
  networks,
}: {
  sourceCode: SourceCode;
  networks: networkType[];
}) {
  const promises: Promise<JobStatusRes>[] = [];
  networks.forEach((network) => {
    promises.push(
      verifyClassOnNetwork({
        sourceCode: sourceCode,
        network: network,
      })
    );
  });
  const res = await Promise.allSettled(promises);
  console.log(res);
}

export default verifyClass;
