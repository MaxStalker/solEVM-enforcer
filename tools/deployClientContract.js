const ethers = require('ethers');

async function deployContract (wallet, artifact, ...args) {
  const _factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );
  const contract = await _factory.deploy(...args);
  const tx = await contract.deployTransaction.wait();

  console.log(`\n
Contract: ${artifact.contractName}
  Address: ${contract.address}
  Transaction Hash: ${tx.transactionHash}
  Deployer: ${tx.from}
  Gas used: ${tx.cumulativeGasUsed.toString()}
  Gas fee in Ether: ${ethers.utils.formatUnits(contract.deployTransaction.gasPrice.mul(tx.cumulativeGasUsed), 'ether')}
  `);

  return contract;
};

(async function () {
  // TODO: Compile contract first
  const Enforcer = require('../build/contracts/Clie.json');

  const rpcURL = process.argv[2] === 'dev' ? 'http://127.0.0.1:8545': process.argv[2];
  const privateKey = process.argv[3];

  const provider = new ethers.providers.JsonRpcProvider(rpcURL);
})();
