const ethers = require("ethers");

async function deployContract(wallet, artifact, ...args) {
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
    Gas fee in Ether: ${ethers.utils.formatUnits(
      contract.deployTransaction.gasPrice.mul(tx.cumulativeGasUsed),
      "ether"
    )}
  `);

  return contract;
}

function getRPC(name = "local") {
  let url;
  switch (name) {
    case "dev":
    case "local":
      url = "http://127.0.0.1:8545";
      break;
    case "goerli":
      url = "https://goerli.infura.io/v3/695665e6569b46c5b7247aedf70543c7";
      break;
    default:
      url = "http://127.0.0.1:8545";
      break;
  }
  return url;
}

module.exports = {
  deployContract,
  getRPC
};
