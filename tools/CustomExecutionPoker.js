const { ExecutionPoker, Merkelizer } = require('./../utils');

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

class CustomExecutionPoker extends ExecutionPoker {
  onSlashed (execId) {
    this.log(`got slashed, executionId(${execId})`);
    // we are done
    process.exit(0);
  }

  async requestExecution (contractAddr, callData) {
    const codeHash = `0x${contractAddr.replace('0x', '').toLowerCase().padEnd(64, '0')}`;
    const dataHash = Merkelizer.dataHash(callData);
    const evmParams = Object.assign(EVMParameters, { codeHash, dataHash });

    return super.requestExecution(evmParams, callData);
  }

  async submitProof (disputeId, computationPath) {
    try {
      await super.submitProof(disputeId, computationPath);
    } catch (e) {
      // ignore for unit test
    }
  }

  async computeCall (evmParams) {
    const res = await super.computeCall(evmParams);

    if (this.logTag === 'solver') {
      this.log('making one leaf invalid');

      const leaf = res.merkle.leaves[0];
      leaf.right.executionState.gasRemaining = 2222;
      leaf.right.hash = Merkelizer.stateHash(
        leaf.right.executionState,
        leaf.right.stackHash,
        leaf.right.memHash,
        evmParams.dataHash,
        evmParams.customEnvironmentHash
      );
      leaf.hash = Merkelizer.hash(leaf.left.hash, leaf.right.hash);
      res.merkle.recal(0);
    }

    return res;
  }
}

module.exports =  CustomExecutionPoker;
