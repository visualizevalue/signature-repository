// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Base64.sol";
import "./libraries/SSTORE2.sol";

struct Signature {
    address[] path;
}

/// @title Repository of Signatures
/// @author VisualizeValue
contract SignatureRepository {
    mapping (address => Signature[]) private signatures;

    /// @dev Emitted when a collector adds a signature.
    event NewSignature(address indexed signer, uint256 index);

    error EmptySignatureData();

    /// @notice Add a new signature with associated data
    /// @param data Array of bytes data representing the signature
    function addSignature(bytes[] calldata data) external {
        if (data.length == 0) revert EmptySignatureData();

        _storeSignature(data);
    }

    /// @notice Add multiple signatures with associated data
    /// @param data Array of arrays of bytes data representing multiple signatures
    function addSignatures(bytes[][] calldata data) external {
        if (data.length == 0) revert EmptySignatureData();

        for (uint256 index = 0; index < data.length; index++) {
            if (data[index].length == 0) revert EmptySignatureData();

            _storeSignature(data[index]);
        }
    }

    /// @dev Store signature data for the sender
    /// @param data Array of bytes data to store
    function _storeSignature(bytes[] calldata data) private {
        uint256 index = signatures[msg.sender].length;

        // Initialize new Signature struct
        signatures[msg.sender].push();

        for (uint256 i = 0; i < data.length; i++) {
            signatures[msg.sender][index].path.push(SSTORE2.write(data[i]));
        }

        emit NewSignature(msg.sender, index);
    }

    /// @notice Get the number of signatures for an address
    /// @param signer Address to query
    /// @return Number of signatures
    function getSignatureCount(address signer) external view returns (uint256) {
        return signatures[signer].length;
    }

    function signaturePath(address signer, uint256 index) public view returns (string memory) {
        bytes memory data;

        for (uint8 i = 0; i < signatures[signer][index].path.length; i++) {
            data = abi.encodePacked(data, SSTORE2.read(setData[set][i]));
        }

        return string(data);
    }

    function svg(address signer, uint256 index) public view returns (string memory) {
        return string(abi.encodePacked(
            '<svg width="1400" height="1400" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">',
                signaturePath(signer, index),
            '</svg>'
        ));
    }

    function uri(address signer, uint256 index) public view returns (string memory) {
        return string(abi.encodePacked(
            'data:image/svg+xml;base64,',
            Base64.encode(generateSVG(signer, index))
        ));
    }
}

