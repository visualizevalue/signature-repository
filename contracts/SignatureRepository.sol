// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./libraries/SSTORE2.sol";

struct Signature {
    address[] path;
}

/// @title Repository of Signatures
/// @author VisualizeValue
contract SignatureRepository {
    mapping (address => Signature[]) private signatures;

    /// @dev Emitted when a collector mints a token.
    event NewSignature(address indexed signer, uint256 index);

    /// @notice Update the encoded data for a given set.
    function addSignature (bytes[] calldata data) external {
        _storeSignature(data);
    }

    /// @notice Update the encoded data for a given set.
    function addSignatures (bytes[][] calldata data) external {
        for (uint256 index = 0; index < data.length; index++) {
            _storeSignature(data[index]);
        }
    }

    /// @dev Update the encoded data for a given set.
    function _storeSignature (bytes[] calldata data) private {
        uint256 index = signatures[msg.sender].length;

        for (uint256 i = 0; i < data.length; i++) {
            signatures[msg.sender][index].path.push(SSTORE2.write(data[i]));
        }

        emit NewSignature(msg.sender, index);
    }
}

