const ethers = require("ethers");
const { getRPC } = require("./utils");

// Goerli
const CONTRACT_ADDRESS = "0x52b4eb32F44365b4309d6109aeca145D2e472E9F";
// Ganache
// const CONTRACT_ADDRESS = "0xec11236797ab30c1d1604c12ee4C48c87E39580E"

(async function() {
  const SimpleMath = require("../build/contracts/SimpleMath.json");

  let rpcURL = getRPC(process.argv[2]);
  const a = process.argv[3] || 2;
  const b = process.argv[4] || 2;

  const provider = new ethers.providers.JsonRpcProvider(rpcURL);

  const computationContract = new ethers.Contract(
    CONTRACT_ADDRESS,
    SimpleMath.abi,
    provider
  );
  const sum = await computationContract.addition(a, b);
  console.log(`Sum: ${sum}`);
})();
