// Load environment variables;
require("dotenv").config();

const ethers = require("ethers");
const { deployContract } = require("./utils");

// Truffle Config
const truffleConfig = require("../truffle-config");

// Contracts
const ClientContract = require("../build/contracts/ClientContract.json");
const Enforcer = require("../build/contracts/Enforcer.json");

const DEPLOYED_CONTRACT = "0x87333897FA15bC37149F6D73bC3cD9939862ca04";
const DEPLOYED_ENFORCER = "0x1e7aEc73f3b81B5Ba8E1642519e8b23094ff7374";

(async function() {
  const network = truffleConfig.networks[process.env.network];
  const provider = new ethers.providers.JsonRpcProvider(network.url);
  const txOverrides = {
    gasLimit: network.gas,
    gasPrice: network.gasPrice
  };

  const privateKey = process.env.DEPLOY_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  const clientContract = new ethers.Contract(
    DEPLOYED_CONTRACT,
    ClientContract.abi,
    wallet
  );
  const enforcerContract = new ethers.Contract(
    DEPLOYED_ENFORCER,
    Enforcer.abi,
    wallet
  );

  clientContract.on(
    clientContract.filters.ComputationAccepted(),
    async (taskHash, parameters, callData, tx) => {
      console.log("CLIENT: Computation request sent to Enforcer");
    }
  );

  clientContract.on(
    clientContract.filters.ComputationAccepted(),
    async (taskHash, parameters, callData, tx) => {
      console.log("CLIENT: Computation request sent to Enforcer");
    }
  );

  clientContract.on(
    clientContract.filters.ResultProcessed(),
    async isProcessed => {
      if(isProcessed){
        console.log("CLIENT: COMPUTATION WAS SUCCESSFULLY PROCESSED :)");
      } else {
        console.log('CLIENT: SOMETHING IS WRONG :(');
      }
    }
  );

  enforcerContract.on(enforcerContract.filters.Requested(), async taskHash => {
    console.log("ENFORCER: Task accepted");
    console.log(`ENFORCER: Task hash: ${taskHash}`);
  });

  enforcerContract.on(enforcerContract.filters.Registered(), async taskHash => {
    console.log("ENFORCER: New result is registered");
    console.log(`ENFORCER: Task hash: ${taskHash}`);
  });

  await clientContract.requestComputation(2, 5, txOverrides);

})();
