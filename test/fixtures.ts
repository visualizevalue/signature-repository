import hre from 'hardhat'
import SignatureRepositoryModule from '../ignition/modules/SignatureRepository'

export async function signatureRepositoryFixture() {
  const [signer0, signer1, signer2, signer3] = await hre.viem.getWalletClients()

  const publicClient = await hre.viem.getPublicClient()

  const { repository } = await hre.ignition.deploy(SignatureRepositoryModule)

  const contract = await hre.viem.getContractAt('SignatureRepository', repository.address)

  return {
    contract,
    signer0,
    signer1,
    signer2,
    signer3,
    publicClient,
  }
}

