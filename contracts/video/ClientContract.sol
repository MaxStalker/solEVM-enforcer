pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;
import '../interfaces/IEnforcer.sol';

contract ClientContract {

	event ComputationAccepted(bytes32 indexed taskHash);
	event ResultProcessed(bool isProcessed);

	address enforcerAddr;
	address computationContract;
	uint a;
	uint b;

	constructor (address _enforcer, address _computationContract) public {
		enforcerAddr = _enforcer;
		computationContract = _computationContract;
	}

	function requestComputation(uint _a, uint _b) public {
		// Store values for future reference
		a = _a;
		b = _b;

		IEnforcer enforcer = IEnforcer(enforcerAddr);

		bytes4 methodSignature = bytes4(keccak256('addition(uint, uint)'));
		bytes memory data = abi.encodePacked(methodSignature, _a, _b);

		IEnforcer.EVMParameters memory params = IEnforcer.EVMParameters({
			origin: msg.sender,
			target: computationContract,
			blockHash: 0,
			blockNumber: 0,
			time: 0,
			txGasLimit: 0xffffffff,
			customEnvironmentHash: 0,
			codeHash: bytes32(bytes20(computationContract)),
			dataHash: keccak256(data)
		});

		bytes32 taskHash = enforcer.request(params, data);
		emit ComputationAccepted(taskHash);
	}

	function finalize(bytes32 _taskHash) public{
		IEnforcer enforcer = IEnforcer(enforcerAddr);
		// bytes4 methodSignature = bytes4(keccak256('getStatus(bytes32)'));
		// bytes memory data = abi.encodePacked(methodSignature, _taskHash);

		(uint256 taskEndTime, bytes32[] memory pathRoots, bytes32[] memory resultHashes) = enforcer.getStatus(_taskHash);

		// 1: Check that time NOW is more than taskStart + challengePeriod
		require(now > taskEndTime, "Task results can still be challenged");

		// 2: Check that resultHashes is array of a single element
		require(resultHashes.length == 1, "Multiple task results. Waiting for challenger...");


		// 3: Compare resultHashes[0] with keccak256(a + b)
		bytes32 mockResult = keccak256(abi.encodePacked(a + b));
		bytes32 finalResultHash = resultHashes[0];
		require(mockResult == finalResultHash, 'Hashes are not equal');

		emit ResultProcessed(true);
	}

}
