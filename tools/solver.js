// Load environment variables;
require("dotenv").config();

const ethers = require('ethers');
const ExecutionPoker = require('./CustomExecutionPoker');

const Verifier = require('./../build/contracts/Verifier.json');
const Enforcer = require('./../build/contracts/Enforcer.json');

// Truffle Config
const truffleConfig = require("../truffle-config");

const GAS_LIMIT = 0xfffffffffffff;
const VERIFIER_ADDRESS = '0xC2A907B3F14F678AD38b5C1bf934950cA68f0389';
const ENFORCER_ADDRESS = '0x1e7aEc73f3b81B5Ba8E1642519e8b23094ff7374';

async function main () {
  // Usage:
  // node ./solver.js privateKey evil
  // Example for Ganache running locally
  // node ./solver.js http://127.0.0.1:8545
  // 0xae08a1d44e33f2d5536a42c6863216ea56d1485c6461ff3444c05fbee3328ac6 1
  const network = truffleConfig.networks[process.env.network];
  const provider = new ethers.providers.JsonRpcProvider(network.url);

  const privateKey = process.argv[2];
  const evil = process.argv[3] || 0; // to submit wrong results

  console.log('Is solver evil? ', evil > 0 ? 'Yes' : 'No');

  const enforcer = new ethers.Contract(ENFORCER_ADDRESS, Enforcer.abi, provider);
  const verifier = new ethers.Contract(VERIFIER_ADDRESS, Verifier.abi, provider);

  // Setup Solver Params
  const solverWallet = new ethers.Wallet(privateKey, provider);
  const role = evil ? 'solver' : 'challenger';

  const execPoker = new ExecutionPoker(
    enforcer,
    verifier,
    solverWallet,
    GAS_LIMIT,
    role
  );
}

function preParse (str) {
  const len = str.length;
  let res = '';
  let openToken = false;

  for (let i = 0; i < len; i++) {
    let v = str[i];

    if (openToken && (v === ',' || v === ']' || v === ' ')) {
      res += '"';
      openToken = false;
    }

    if (v === '0' && str[i + 1] === 'x') {
      res += '"';
      openToken = true;
    }

    res += v;
  }

  if (openToken) {
    res += '"';
  }

  return res;
}

function onException (e) {
  console.error(e);
  process.exit(1);
}

process.on('uncaughtException', onException);
process.on('unhandledRejection', onException);

main();
