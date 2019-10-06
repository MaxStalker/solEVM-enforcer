// Load environment variables;
require("dotenv").config();
const ethers = require("ethers");
const { deployContract } = require("./utils");
const truffleConfig = require("../truffle-config");

const SimpleMath = require("../build/contracts/SimpleMath");

(async function() {
  const networkName = process.env.network;
  console.log(`Deploying to ${networkName} network`);

  const network = truffleConfig.networks[networkName];
  const provider = new ethers.providers.JsonRpcProvider(network.url);

  const privateKey = process.env.DEPLOY_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);

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
})();
