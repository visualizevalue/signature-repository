# Signature Repository

A smart contract system for storing and retrieving SVG signatures on-chain. Each signature is stored as optimized path data and can be retrieved in various formats including SVG and base64-encoded data URIs.

## Features

- Store SVG signatures on-chain
- Optimize signature paths for gas efficiency
- Retrieve signatures as SVG or data URI
- Batch signature processing
- Custom stroke color and width support

## Prerequisites

- Node.js >= 16
- Hardhat
- An Ethereum RPC URL (for mainnet interaction)

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd signature-repository
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
ETHEREUM_RPC_URL=     # Your Ethereum RPC URL
PRIVATE_KEY=          # Your wallet private key
ETHERSCAN_API_KEY=    # For contract verification
```

## Working with Signatures

### Signature Requirements

- SVG canvas size: 512x512 pixels
- Single path element per SVG
- Valid SVG path data (d attribute)

### Processing Signatures

1. Place your SVG files in a new folder under `./data/`:
```bash
mkdir ./data/your_folder_name
# Add your SVG files here
```

2. Process and optimize signatures:
```bash
npx hardhat process-signatures --folder your_folder_name
```

This command:
- Extracts path data from SVGs
- Optimizes coordinates for gas efficiency
- Creates two JSON files:
  - `./data/signatures-your_folder_name.json` (original paths)
  - `./data/signatures-your_folder_name-sm.json` (optimized paths)
- Creates optimized SVGs in `./data/your_folder_name/sm/`

### Storing Signatures On-Chain

Store your signatures on mainnet:
```bash
npx hardhat store-signatures \
  --contract 0xDE04A2537f84C8176f1B3F624405419a1E28C3F0 \
  --json ./data/signatures-your_folder_name-sm.json \
  --network mainnet
```

Options:
- `--contract`: Deployed contract address
- `--json`: Path to processed signatures JSON
- `--network`: Target network

## Deployed Contracts

The SignatureRepository contract is deployed on mainnet:

```
Mainnet: 0xDE04A2537f84C8176f1B3F624405419a1E28C3F0
```

## Development

### Local Testing

```bash
# Show available accounts
npx hardhat accounts

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Clean artifacts
npx hardhat clean

# Show all available commands
npx hardhat help
```

### Contract Deployment

This project uses [Ignition](https://hardhat.org/ignition/docs/getting-started#overview) for deterministic deployments.

#### Local Development

1. Start a local node:
```bash
npx hardhat node
```

2. Deploy contracts:
```bash
npx hardhat ignition deploy ./ignition/modules/SignatureRepository.ts --network localhost
```

## Contract Interface

The deployed contract provides several methods to interact with stored signatures:

```solidity
// Store signatures
function addSignature(bytes[] calldata data) external
function addSignatures(bytes[][] calldata data) external

// Retrieve signatures
function signaturePath(address signer, uint256 index) public view returns (string memory)
function svg(address signer, uint256 index) public view returns (string memory)
function svg(address signer, uint256 index, string memory color, string memory width) public view returns (string memory)
function uri(address signer, uint256 index) public view returns (string memory)
function uri(address signer, uint256 index, string memory color, string memory width) public view returns (string memory)
```

