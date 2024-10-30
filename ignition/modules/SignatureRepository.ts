import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const SignatureRepositoryModule = buildModule('SignatureRepository', (m) => {
  const repository = m.contract('SignatureRepository')

  return { repository }
})

export default SignatureRepositoryModule

