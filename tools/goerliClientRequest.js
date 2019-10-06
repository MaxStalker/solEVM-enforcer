// Load environment variables;
require("dotenv").config();
const { Merkelizer } = require("../utils");
const ethers = require("ethers");
const truffleConfig = require("../truffle-config");

// Contracts
const Enforcer = require("../build/contracts/Enforcer.json");
const ENFORCER_ADDRESS = "0x6949a2a84C9f32C0C905C84686f129a6abC74Ea1";

const SimpleMath = require("../build/contracts/SimpleMath");
const SIMPLE_MATH_ADDRESS = "0x4fA1Ce39320c7e324f242699e2577dd7F8260901";

(async function() {
  const network = truffleConfig.networks[process.env.network];
  const provider = new ethers.providers.JsonRpcProvider(network.url);

  const privateKey = process.env.DEPLOY_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);

  const simpleMath = new ethers.Contract(
    SIMPLE_MATH_ADDRESS,
    SimpleMath.abi,
    wallet
  );
  const enforcer = new ethers.Contract(ENFORCER_ADDRESS, Enforcer.abi, wallet);

  enforcer.on(enforcer.filters.Requested(), async taskHash => {
    console.log("\nENFORCER: Task accepted");
    console.log(`ENFORCER: Task hash: ${taskHash}`);
  });

  enforcer.on(
    enforcer.filters.Registered(),
    async (taskHash, solverPathRoot, execitionDepth, result) => {
      console.log("\nENFORCER: New result is registered");
      console.log(`ENFORCER: Task hash: ${taskHash}`);
      console.log(`ENFORCER: Result: ${result}`);
    }
  );

   enforcer.on(
    enforcer.filters.DisputeInitialised(),
    async (disputeId, executionId) => {
      console.log("\nENFORCER: Execution result challenged");
      console.log(`ENFORCER: Dispute ID: ${disputeId}`);
      console.log(`ENFORCER: Execution ID: ${executionId}`);
    }
  );

  enforcer.on(enforcer.filters.Slashed(), async (executionId, solver) => {
    console.log("\nENFORCER: One of solvers was slashed");
    console.log(`ENFORCER: ExecutionId: ${executionId}`);
    console.log(`ENFORCER: Slashed Solver Address: ${solver}`);
  });

  const EVMParameters = {
    origin: "0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1",
    target: "0xfeefeefeefeefeefeefeefeefeefeefeefeefee0",
    blockHash:
      "0xdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdc",
    blockNumber: 123,
    time: 1560775755,
    txGasLimit: 0xffffffffff,
    customEnvironmentHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    codeHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    dataHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000"
  };

  const a = 4;
  const b = 15;
  const codeHash = `0x${SIMPLE_MATH_ADDRESS.replace("0x", "")
    .toLowerCase()
    .padEnd(64, "0")}`;
  const callData = simpleMath.interface.functions["addition"].encode([a, b]);
  const dataHash = Merkelizer.dataHash(callData);
  const evmParams = Object.assign(EVMParameters, { codeHash, dataHash });

  let tx = await enforcer.request(evmParams, callData);
  await tx.wait();
  console.log('Task requested!');

  console.log("Listening for solvers and challengers now...");
})();
