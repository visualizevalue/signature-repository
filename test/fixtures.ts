import { parseEther } from 'viem'
import hre from 'hardhat'
import SignatureRepositoryModule from '../ignition/modules/SignatureRepository'
import { JALIL, VV } from './../helpers/constants'

export async function signatureRepositoryFixture() {
  const [signer0, signer1, signer2, signer3] = await hre.viem.getWalletClients()

  const publicClient = await hre.viem.getPublicClient()

  const testClient = await hre.viem.getTestClient()
  await testClient.impersonateAccount({ address: JALIL })
  await testClient.impersonateAccount({ address: VV })
  await signer0.sendTransaction({ to: JALIL, value: parseEther('1') })
  await signer0.sendTransaction({ to: VV, value: parseEther('1') })

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

