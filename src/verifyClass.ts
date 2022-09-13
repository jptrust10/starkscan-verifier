import { SourceCode, networkType } from "./types.js";
import axios from "axios";
import { waitFor } from "./utils.js";
import { getStarkscanClassUrl, JobStatusRes } from "./api.js";
import ora from "ora";
import inquirer from "inquirer";
const ui = new inquirer.ui.BottomBar();

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

  const spinner = ora().start();

  while (true) {
    const jobStatus = await getJobStatus({
      jobId: jobId,
      network: network,
    });

    spinner.text = `Verifying ${sourceCode.name} on ${network}. Job ID: ${jobId}. Status: ${jobStatus.status}`;

    if (jobStatus.status === "SUCCESS" || jobStatus.status === "FAILED") {
      if (jobStatus.status === "SUCCESS") {
        // TODO jkoh add check when user input class hash / contract
        // spinner.succeed(${sourCode.name} is already verified on ${network}.\n);
        // spinner.info(
        //   `View verified ${
        //     sourceCode.name
        //   } on StarkScan: ${getStarkscanClassUrl({
        //     classHash: jobStatus.class_hash,
        //     network: network,
        //   })}\n`
        // );
        // spinner.stop();

        spinner.succeed(
          `Verifying ${sourceCode.name} on ${network} succeeded!\n`
        );
        spinner.info(
          `View verified ${
            sourceCode.name
          } on Starkscan: ${getStarkscanClassUrl({
            classHash: jobStatus.class_hash,
            network: network,
          })}\n`
        );
        spinner.stop();
      } else if (jobStatus.status === "FAILED") {
        spinner.fail(`Verifying ${sourceCode.name} on ${network} failed.\n`);
        spinner.warn(`Error: ${jobStatus.error_message}\n`);
        spinner.stop();
      }

      return jobStatus;
    }

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
}

export default verifyClass;
