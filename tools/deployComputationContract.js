const ethers = require("ethers");
const { deployContract, getRPC } = require("./utils");

(async function() {
  const SimpleMath = require("../build/contracts/SimpleMath.json");

  let rpcURL = getRPC(process.argv[2]);
  const privateKey = process.argv[3];

  const provider = new ethers.providers.JsonRpcProvider(rpcURL);
  const wallet = new ethers.Wallet(privateKey, provider);
  const computationContract = await deployContract(wallet, SimpleMath);
  console.log('Done');
})();
