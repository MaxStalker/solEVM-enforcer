// Load environment variables;
require("dotenv").config();

const ethers = require("ethers");
const { Merkelizer } = require('./../utils');

// Truffle Config
const truffleConfig = require("../truffle-config");

// Contracts
const SimpleMath = require("../build/contracts/SimpleMath.json");
const ClientContract = require("../build/contracts/ClientContract.json");
const Enforcer = require("../build/contracts/Enforcer.json");

const DEPLOYED_COMPUTATION = "0xB10254F302b6C4E240E294848a08339356F90Ac8";
const DEPLOYED_CONTRACT = "0x8309560606900678FBBDC64F08C901E2e106135a";
const DEPLOYED_ENFORCER = "0x22A9bCAeCb0dA45dABf3515a4CDd0D340970094b";

(async function() {
  const network = truffleConfig.networks[process.env.network];
  const provider = new ethers.providers.JsonRpcProvider(network.url);
  const txOverrides = {
    gasLimit: network.gas,
    gasPrice: network.gasPrice
  };

  const privateKey = process.env.DEPLOY_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);

  // Contracts
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
  const computationContract = new ethers.Contract(
    DEPLOYED_COMPUTATION,
    SimpleMath.abi,
    wallet
  );

  // Events listeners
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


  // Directly request computation on Enforcer instead of Client Contract
  const GAS_LIMIT = 0xfffffffffffff;
  const EVMParameters = {
    origin: '0xa1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1',
    target: '0xfeefeefeefeefeefeefeefeefeefeefeefeefee0',
    blockHash: '0xdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdcdc',
    blockNumber: 123,
    time: 1560775755,
    txGasLimit: 0xffffffffff,
    customEnvironmentHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    codeHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    dataHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
  };

  const a = 2;
  const b = 4;
  const codeHash = `0x${DEPLOYED_COMPUTATION.replace('0x', '').toLowerCase().padEnd(64, '0')}`;
  const callData = computationContract.interface.functions["addition"].encode([ a, b]);
  const dataHash = Merkelizer.dataHash(callData);
  const evmParams = Object.assign(EVMParameters, { codeHash, dataHash });

  await clientContract.requestComputation(2, 6, txOverrides);
  // let tx = await enforcerContract.request(evmParams, callData);
  // tx = await tx.wait();
  // const taskHash = tx.events[0].args.taskHash;
  // console.log(`Registered computation with taskHash = ${taskHash}`);
  console.log('Listening for solvers and challengers now...');
})();
