pragma solidity ^0.5.2;

contract SimpleMath {
	function addition(uint _a, uint _b) public pure returns (uint) {
		uint c = _a + _b;
		return c;
	}
}
