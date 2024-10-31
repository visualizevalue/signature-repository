// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Interface for SignatureRepository
/// @author VisualizeValue
/// @notice Interface for interacting with the SignatureRepository contract
interface ISignatureRepository {
    /// @notice Structure representing a signature with its associated data paths
    /// @dev Each path address points to SSTORE2-stored signature data
    struct Signature {
        address[] path;
    }

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
    function addSignature(bytes[] calldata data) external;

    /// @notice Add multiple signatures with associated data
    /// @param data Array of arrays of bytes data representing multiple signatures
    function addSignatures(bytes[][] calldata data) external;

    /// @notice Get the number of signatures for an address
    /// @param signer Address to query
    /// @return count Number of signatures stored for the address
    function getSignatureCount(address signer) external view returns (uint256 count);

    /// @notice Get the SVG path data for a specific signature
    /// @param signer Address of the signature owner
    /// @param index Index of the signature to retrieve
    /// @return Full SVG path data as a string
    function signaturePath(address signer, uint256 index) external view returns (string memory);

    /// @notice Generate a complete SVG for a signature
    /// @param signer Address of the signature owner
    /// @param index Index of the signature to generate SVG for
    /// @return Full SVG markup as a string
    function svg(address signer, uint256 index) external view returns (string memory);

    /// @notice Generate a complete SVG for a signature with custom styling
    /// @param signer Address of the signature owner
    /// @param index Index of the signature to generate SVG for
    /// @param color The signature stroke color
    /// @param width The signature stroke width
    /// @return Full SVG markup as a string
    function svg(address signer, uint256 index, string memory color, string memory width) external view returns (string memory);

    /// @notice Generate a base64 encoded data URI for the signature SVG
    /// @param signer Address of the signature owner
    /// @param index Index of the signature to generate URI for
    /// @return Base64 encoded data URI containing the SVG
    function uri(address signer, uint256 index) external view returns (string memory);

    /// @notice Generate a base64 encoded data URI for the signature SVG with custom styling
    /// @param signer Address of the signature owner
    /// @param index Index of the signature to generate URI for
    /// @param color The signature stroke color
    /// @param width The signature stroke width
    /// @return Base64 encoded data URI containing the SVG
    function uri(address signer, uint256 index, string memory color, string memory width) external view returns (string memory);
}

