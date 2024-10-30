import { task, types } from 'hardhat/config'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getAddress, toHex } from 'viem'

interface SignatureData {
  [key: string]: string
}

task('store-signatures', 'Store signatures in the deployed contract')
  .addParam('json', 'Path to the signatures JSON file', './data/signatures-sm.json', types.string)
  .addParam('contract', 'Address of the deployed SignatureRepository contract')
  .setAction(async (taskArgs, hre) => {
    const { json, contract: contractAddress } = taskArgs
    const [signer] = await hre.viem.getWalletClients()
    const publicClient = await hre.viem.getPublicClient()

    // Validate contract address
    try {
      getAddress(contractAddress)
    } catch (e) {
      console.error('Invalid contract address')
      return
    }

    console.log('Loading signatures from:', json)
    console.log('Contract address:', contractAddress)

    // Load JSON file
    let signatures: SignatureData
    try {
      const jsonContent = readFileSync(join(process.cwd(), json), 'utf-8')
      signatures = JSON.parse(jsonContent)
    } catch (e) {
      console.error('Error loading JSON file:', e)
      return
    }

    // Get contract instance
    const contract = await hre.viem.getContractAt('SignatureRepository', contractAddress)

    console.log('\nPreparing signatures for storage...')

    // Convert signatures to bytes arrays and batch them
    const BATCH_SIZE = 10
    const batches: `0x${string}`[][][] = []
    let currentBatch: `0x${string}`[][] = []

    // Convert each signature path to a hex array
    for (const [_id, path] of Object.entries(signatures)) {
      // Each signature is represented as a single-element array of hex strings
      const signatureArray = [toHex(new TextEncoder().encode(path))]
      currentBatch.push(signatureArray)

      if (currentBatch.length === BATCH_SIZE) {
        batches.push(currentBatch)
        currentBatch = []
      }
    }

    // Add remaining signatures
    if (currentBatch.length > 0) {
      batches.push(currentBatch)
    }

    console.log(`Found ${Object.keys(signatures).length} signatures`)
    console.log(`Split into ${batches.length} batches of max ${BATCH_SIZE} signatures`)

    // Store signatures
    console.log('\nStoring signatures...')
    let successCount = 0
    let failCount = 0

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i]
      process.stdout.write(`Processing batch ${i + 1}/${batches.length}... `)

      try {
        // Call addSignatures with the batch of signature arrays
        const hash = await contract.write.addSignatures([batch], {
          account: signer.account.address,
        })

        await publicClient.waitForTransactionReceipt({ hash })

        successCount += batch.length
        console.log('✅')
      } catch (e) {
        console.log('❌')
        console.error(`Error in batch ${i + 1}:`, e)
        failCount += batch.length
      }
    }

    // Final summary
    console.log('\nStorage complete!')
    console.log('Summary:')
    console.log(`- Successfully stored: ${successCount} signatures`)
    if (failCount > 0) {
      console.log(`- Failed to store: ${failCount} signatures`)
    }

    // Verify total signatures stored
    try {
      const count = await contract.read.getSignatureCount([signer.account.address])
      console.log(`\nVerification: Contract has ${count} signatures stored`)
    } catch (e) {
      console.error('Error verifying signature count:', e)
    }
  })
