// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Base64.sol";
import "./libraries/SSTORE2.sol";

/// @notice Structure representing a signature with its associated data paths
/// @dev Each path address points to SSTORE2-stored signature data
struct Signature {
    address[] path;
}

/// @title Repository of Signatures
/// @author VisualizeValue
/// @notice A contract for storing and retrieving SVG signature data
contract SignatureRepository {
    /// @notice Mapping of user addresses to their array of signatures
    mapping (address => Signature[]) private signatures;

    /// @notice Emitted when a new signature is added
    /// @param signer The address that added the signature
    /// @param index The index of the new signature in their array
    event NewSignature(address indexed signer, uint256 index);

    /// @notice Thrown when empty signature data is provided
    error EmptySignatureData();
    /// @notice Thrown when accessing an invalid signature index
    error InvalidSignatureIndex();
    /// @notice Thrown when trying to read from an invalid SSTORE2 address
    error InvalidStorageAddress();

    /// @notice Add a new signature with associated data
    /// @param data Array of bytes data representing the signature path components
    /// @dev Each element in data array will be stored separately using SSTORE2
    function addSignature(bytes[] calldata data) external {
        if (data.length == 0) revert EmptySignatureData();

        _storeSignature(data);
    }

    /// @notice Add multiple signatures with associated data
    /// @param data Array of arrays of bytes data representing multiple signatures
    /// @dev Each inner array represents one complete signature
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
        if (data.length == 0) revert EmptySignatureData();

        uint256 index = signatures[msg.sender].length;

        signatures[msg.sender].push();

        for (uint256 i = 0; i < data.length; i++) {
            if (data[i].length == 0) revert EmptySignatureData();
            address storedAt = SSTORE2.write(data[i]);
            signatures[msg.sender][index].path.push(storedAt);
        }

        emit NewSignature(msg.sender, index);
    }

    /// @notice Get the number of signatures for an address
    /// @param signer Address to query
    /// @return count Number of signatures stored for the address
    function getSignatureCount(address signer) external view returns (uint256 count) {
        return signatures[signer].length;
    }

    /// @notice Get the SVG path data for a specific signature
    /// @param signer Address of the signature owner
    /// @param index Index of the signature to retrieve
    /// @return Full SVG path data as a string
    function signaturePath(address signer, uint256 index) public view returns (string memory) {
        if (index >= signatures[signer].length) revert InvalidSignatureIndex();

        bytes memory data;
        uint256 pathLength = signatures[signer][index].path.length;

        for (uint256 i = 0; i < pathLength; i++) {
            address pathAddress = signatures[signer][index].path[i];
            if (pathAddress == address(0)) revert InvalidStorageAddress();

            data = abi.encodePacked(
                data,
                SSTORE2.read(signatures[signer][index].path[i])
            );
        }

        return string(data);
    }

    /// @notice Generate a complete SVG for a signature
    /// @param signer Address of the signature owner
    /// @param index Index of the signature to generate SVG for
    /// @return Full SVG markup as a string
    function svg(address signer, uint256 index) public view returns (string memory) {
        return svg(signer, index, 'black', '4px');
    }

    /// @notice Generate a complete SVG for a signature
    /// @param signer Address of the signature owner
    /// @param index Index of the signature to generate SVG for
    /// @param color The signature stroke color
    /// @param width The signature stroke width
    /// @return Full SVG markup as a string
    function svg(address signer, uint256 index, string memory color, string memory width) public view returns (string memory) {
        return string(abi.encodePacked(
            '<svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">'
                '<p '
                    'stroke="', color, '" '
                    'stroke-width="', width, '" '
                    'fill="none" '
                    'd="', signaturePath(signer, index), '"'
                '/>'
            '</svg>'
        ));
    }

    /// @notice Generate a base64 encoded data URI for the signature SVG
    /// @param signer Address of the signature owner
    /// @param index Index of the signature to generate URI for
    /// @return Base64 encoded data URI containing the SVG
    function uri(address signer, uint256 index) public view returns (string memory) {
        return string(abi.encodePacked(
            'data:image/svg+xml;base64,',
            Base64.encode(bytes(svg(signer, index)))
        ));
    }

    /// @notice Generate a base64 encoded data URI for the signature SVG
    /// @param signer Address of the signature owner
    /// @param index Index of the signature to generate URI for
    /// @param color The signature stroke color
    /// @param width The signature stroke width
    /// @return Base64 encoded data URI containing the SVG
    function uri(address signer, uint256 index, string memory color, string memory width) public view returns (string memory) {
        return string(abi.encodePacked(
            'data:image/svg+xml;base64,',
            Base64.encode(bytes(svg(signer, index, color, width)))
        ));
    }
}
