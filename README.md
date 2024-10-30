# Signature Repository

A simple repository of SVG signatures

## Working with Hardhat

Copy the environment variables (and fill them out): `cp .env.example .env`

Try running some of the following tasks:

```bash
npx hardhat accounts # or the shorthand via `hh accounts`
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat help
```

## Deploying contracts

We use [Ignition](https://hardhat.org/ignition/docs/getting-started#overview) for contract deployments.

```bash
hh node # start a local node

hh ignition deploy ./ignition/modules/SignatureRepository.ts --network localhost
```
