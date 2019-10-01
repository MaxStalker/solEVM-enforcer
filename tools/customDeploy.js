const ethers = require("ethers");
const { getRPC, deployContract } = require("./utils");

// Truffle Config
const truffleConfig = require('../truffle-config');

// Contracts
const Verifier = require("../build/contracts/Verifier.json");
const Enforcer = require("../build/contracts/Enforcer.json");
const ClientContract = require("../build/contracts/ClientContract");
const SimpleMath = require("../build/contracts/SimpleMath");

(async function() {
  // let rpcURL = getRPC(process.argv[2]);
  // const privateKey = process.argv[3];
  // const provider = new ethers.providers.JsonRpcProvider(rpcURL);
  // const wallet = new ethers.Wallet(privateKey, provider);

  // Change this params to adjust enforcer;
  const verifierTimeout = 1800;
  const taskPeriod = 43200;
  const challengePeriod = 21600;
  const bondAmount = 10000000000000000;
  const maxExecutionDepth = 10;

  console.log(process.env.network);

})();
