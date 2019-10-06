// Load environment variables;
require("dotenv").config();
const ethers = require("ethers");
const truffleConfig = require("../truffle-config");

const Enforcer = require("../build/contracts/Enforcer.json");
const ENFORCER_ADDRESS = "0x6949a2a84C9f32C0C905C84686f129a6abC74Ea1";

const TASK_HASH =
  "0xe1bed23f2b771562c0dfdfbb27e28aabfb2a66ac7160ad396e37a8b9542a4ae0";

(async function() {
  const network = truffleConfig.networks[process.env.network];
  const provider = new ethers.providers.JsonRpcProvider(network.url);

  const privateKey = process.env.DEPLOY_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  const enforcer = new ethers.Contract(ENFORCER_ADDRESS, Enforcer.abi, wallet);

  const a = 4;
  const b = 15;

  const predictedResultHash = ethers.utils.solidityKeccak256(
    ["uint256"],
    [a + b]
  );
  console.log("\nPredicted Hash:", predictedResultHash);

  let status = await enforcer.getStatus(TASK_HASH);
  console.log({ status });
})();
