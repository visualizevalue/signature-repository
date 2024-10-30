import { expect } from 'chai'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { signatureRepositoryFixture } from './fixtures'
import { encodePacked, getAddress } from 'viem'

describe('SignatureRepository', function () {
  // Test data
  const sampleSignature1 = [
    encodePacked(['string'], ['M10 10 L90 90']),
    encodePacked(['string'], ['M20 20 L80 80'])
  ]
  const sampleSignature2 = [
    encodePacked(['string'], ['M30 30 L70 70'])
  ]
  const emptySignature: Uint8Array[] = []
  const signatureWithEmptyPath = [[]]

  describe('Storing signatures', function () {
    it('should allow storing a single signature', async function () {
      const { contract, signer0 } = await loadFixture(signatureRepositoryFixture)

      await expect(contract.write.addSignature([sampleSignature1]))
        .to.emit(contract, 'NewSignature')
        .withArgs(getAddress(signer0.account.address), 0)

      const count = await contract.read.getSignatureCount([signer0.account.address])
      expect(count).to.equal(1n)
    })

    it('should allow storing multiple signatures', async function () {
      const { contract, signer0 } = await loadFixture(signatureRepositoryFixture)

      await expect(contract.write.addSignatures([[sampleSignature1]]))
        .to.emit(contract, 'NewSignature')
        .withArgs(getAddress(signer0.account.address), 0)

      await expect(contract.write.addSignatures([[sampleSignature2]]))
        .to.emit(contract, 'NewSignature')
        .withArgs(getAddress(signer0.account.address), 1)

      const count = await contract.read.getSignatureCount([signer0.account.address])
      expect(count).to.equal(2n)
    })

    it('should revert when storing empty signature data', async function () {
      const { contract } = await loadFixture(signatureRepositoryFixture)

      await expect(contract.write.addSignature([emptySignature]))
        .to.be.rejectedWith('EmptySignatureData')
    })

    it('should revert when storing empty signature array', async function () {
      const { contract } = await loadFixture(signatureRepositoryFixture)

      await expect(contract.write.addSignatures([[]]))
        .to.be.rejectedWith('EmptySignatureData')
    })

    it('should revert when storing signature with empty path', async function () {
      const { contract } = await loadFixture(signatureRepositoryFixture)

      await expect(contract.write.addSignatures([signatureWithEmptyPath]))
        .to.be.rejectedWith('EmptySignatureData')
    })
  })

  describe('Retrieving Signatures', function () {
    it('should allow reading signature paths', async function () {
      const { contract, signer0 } = await loadFixture(signatureRepositoryFixture)

      await expect(contract.write.addSignature([sampleSignature1]))
        .to.emit(contract, 'NewSignature')
        .withArgs(getAddress(signer0.account.address), 0)

      const path = await contract.read.signaturePath([signer0.account.address, 0n])
      expect(path).to.include('M10 10 L90 90')
      expect(path).to.include('M20 20 L80 80')
    })

    it('should generate correct SVG', async function () {
      const { contract, signer0 } = await loadFixture(signatureRepositoryFixture)

      await expect(contract.write.addSignature([sampleSignature1]))
        .to.emit(contract, 'NewSignature')
        .withArgs(getAddress(signer0.account.address), 0)

      const svg = await contract.read.svg([signer0.account.address, 0n])
      expect(svg).to.include('<svg ')
      expect(svg).to.include('viewBox="0 0 512 512"')
      expect(svg).to.include('xmlns="http://www.w3.org/2000/svg"')
      expect(svg).to.include('M10 10 L90 90')
      expect(svg).to.include('M20 20 L80 80')
    })

    it('should generate correct URI', async function () {
      const { contract, signer0 } = await loadFixture(signatureRepositoryFixture)

      await expect(contract.write.addSignature([sampleSignature1]))
        .to.emit(contract, 'NewSignature')
        .withArgs(getAddress(signer0.account.address), 0)

      const uri = await contract.read.uri([signer0.account.address, 0n])
      expect(uri).to.include('data:image/svg+xml;base64,')
      // Decode base64 and verify content
      const base64Content = uri.split(',')[1]
      const decodedContent = Buffer.from(base64Content, 'base64').toString()
      expect(decodedContent).to.include('<svg')
      expect(decodedContent).to.include('M10 10 L90 90')
    })

    it('should revert when accessing invalid signature index', async function () {
      const { contract, signer0 } = await loadFixture(signatureRepositoryFixture)

      await expect(contract.read.signaturePath([signer0.account.address, 0n]))
        .to.be.rejectedWith('InvalidSignatureIndex')
    })
  })

  describe('Edge cases', function () {
    it('should handle multiple users with signatures', async function () {
      const { contract, signer0, signer1 } = await loadFixture(signatureRepositoryFixture)

      await expect(contract.write.addSignature([sampleSignature1]))
        .to.emit(contract, 'NewSignature')
        .withArgs(getAddress(signer0.account.address), 0)

      await expect(contract.write.addSignature([sampleSignature2], { account: signer1.account }))
        .to.emit(contract, 'NewSignature')
        .withArgs(getAddress(signer1.account.address), 0)

      // Verify counts
      const count0 = await contract.read.getSignatureCount([signer0.account.address])
      const count1 = await contract.read.getSignatureCount([signer1.account.address])
      expect(count0).to.equal(1n)
      expect(count1).to.equal(1n)

      // Verify content
      const path0 = await contract.read.signaturePath([signer0.account.address, 0n])
      const path1 = await contract.read.signaturePath([signer1.account.address, 0n])
      expect(path0).to.include('M10 10 L90 90')
      expect(path1).to.include('M30 30 L70 70')
    })

    it('should handle large signatures', async function () {
      const { contract, signer0 } = await loadFixture(signatureRepositoryFixture)

      // Create a large signature path
      const largePath = 'M ' + Array(100).fill('10 10 L 90 90').join(' ')
      const largeSignature = [encodePacked(['string'], [largePath])]

      await expect(contract.write.addSignature([largeSignature]))
        .to.emit(contract, 'NewSignature')
        .withArgs(getAddress(signer0.account.address), 0)

      const svg = await contract.read.svg([signer0.account.address, 0n])
      expect(svg).to.include(largePath)
    })
  })
})
