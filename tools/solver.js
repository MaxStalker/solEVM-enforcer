#!/usr/bin/env node
'use strict';

const ethers = require('ethers');
const ExecutionPoker = require('./CustomExecutionPoker');

const GAS_LIMIT = 0xfffffffffffff;
const VERIFIER_ADDRESS = '0x2FDc7d3848C0FcdbF85195837Bb961c9f0728279';
const ENFORCER_ADDRESS = '0x0b67a7e7286BcC4Ef3a24cfc4c94943982D99f3F';

async function main () {
  // Usage:
  // node ./solver.js rpcURL privateKey enforcer verifier evil
  // Example for Ganache running locally
  // node ./solver.js http://127.0.0.1:8545 0xae08a1d44e33f2d5536a42c6863216ea56d1485c6461ff3444c05fbee3328ac6 0xc3c78ab57905bd8352344ed979afa1d08e06ec94 0x3c4de68ae41493172fdc765fe07f7495a95b02a0
  const rpcURL = process.argv[2] === 'dev' ? 'http://127.0.0.1:8545': process.argv[2];
  const privateKey = process.argv[3];

  // so one of the solvers would submit results
  const evil = process.argv[4] || 0;

  console.log('Is solver evil? ', evil > 0);

  // Setup Provider
  const provider = new ethers.providers.JsonRpcProvider(rpcURL);

  // Setup Enforcer and Verifier
  let Verifier;
  let Enforcer;

  try {
    Verifier = require('./../build/contracts/Verifier.json');
    Enforcer = require('./../build/contracts/Enforcer.json');
  } catch (e) {
    console.error('Please run `npm run compile:contracts` first. 😉');
    return;
  }

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
