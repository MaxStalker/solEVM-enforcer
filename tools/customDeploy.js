// Load environment variables;
require("dotenv").config();

const ethers = require("ethers");
const { deployContract } = require("./utils");

// Truffle Config
const truffleConfig = require("../truffle-config");

// Contracts
const Verifier = require("../build/contracts/Verifier.json");
const Enforcer = require("../build/contracts/Enforcer.json");
const ClientContract = require("../build/contracts/ClientContract");
const SimpleMath = require("../build/contracts/SimpleMath");

(async function() {
  const network = truffleConfig.networks[process.env.network];
  const provider = new ethers.providers.JsonRpcProvider(network.url);

  const txOverrides = {
    gasLimit: network.gas,
    gasPrice: network.gasPrice
  };

  const privateKey = process.env.DEPLOY_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);

  // Change this params to adjust enforcer;
  const verifierTimeout = 1800;
  const taskPeriod = 600000;
  const challengePeriod = 200000;
  const bondAmount = "10000000000000000";
  const maxExecutionDepth = 10;

  console.log("Deploy Verifier and Enforcer Contracts");
  const verifier = await deployContract(
    wallet,
    Verifier,
    verifierTimeout,
    txOverrides
  );

  const enforcer = await deployContract(
    wallet,
    Enforcer,
    verifier.address,
    taskPeriod,
    challengePeriod,
    bondAmount,
    maxExecutionDepth,
    txOverrides
  );

  console.log("\nSet Enforcer on Verifier\n", enforcer.address);
  await (await verifier.setEnforcer(enforcer.address, txOverrides)).wait();

  console.log("\nDeploy Client and Computation contracts");
  const simpleMath = await deployContract(wallet, SimpleMath);

  // Simple check that our computation contract works as expected
  const a = 3;
  const b = 6;
  const sum = await simpleMath.addition(a, b);
  const correct = sum.eq(ethers.utils.bigNumberify(a + b))
    ? "correct"
    : "wrong";
  console.log(`Requesting computation of ${a} + ${b}`);
  console.log(`Computation Contract result is ${correct}: ${sum}`);

  const clientContract = await deployContract(
    wallet,
    ClientContract,
    enforcer.address,
    simpleMath.address
  );

  console.log(`Job done! All contracts are deployed to ${process.env.network}`);
})();
