import { task } from 'hardhat/config'
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs'
import { join } from 'path'

interface PathData {
  [key: string]: string
}

function roundToInteger(numStr: string): string {
  return parseFloat(numStr).toFixed(1).toString()
}

function roundPathData(pathD: string): string {
  return pathD.replace(/[-+]?[0-9]*\.?[0-9]+/g, roundToInteger)
}

function extractPathData(svgContent: string): string {
  const match = svgContent.match(/d="([^"]*)"/)
  return match ? match[1] : ''
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

function compareFiles(file1Path: string, file2Path: string): void {
  const size1 = statSync(file1Path).size
  const size2 = statSync(file2Path).size
  const reduction = size1 - size2
  const percentReduction = ((reduction / size1) * 100).toFixed(2)

  console.log('\nSize comparison:')
  console.log(`signatures.json:     ${formatBytes(size1)}`)
  console.log(`signatures-sm.json:  ${formatBytes(size2)}`)
  console.log(`Reduction:          ${formatBytes(reduction)} (${percentReduction}%)`)

  // Calculate average path size
  const data1 = JSON.parse(readFileSync(file1Path, 'utf8'))
  const data2 = JSON.parse(readFileSync(file2Path, 'utf8'))

  const avgSize1 = size1 / Object.keys(data1).length
  const avgSize2 = size2 / Object.keys(data2).length

  console.log('\nAverage path size:')
  console.log(`Original:           ${formatBytes(avgSize1)}`)
  console.log(`Rounded:            ${formatBytes(avgSize2)}`)
}

task('process-signatures', 'Process signature SVG files')
  .setAction(async (_, hre) => {
    console.log('Processing signature files...')

    const baseDir = './data'
    const jackDir = join(baseDir, 'jack')
    const smallDir = join(jackDir, 'sm')

    // Create directories if they don't exist
    if (!existsSync(smallDir)) {
      mkdirSync(smallDir, { recursive: true })
    }

    const pathData: PathData = {}
    const pathDataSm: PathData = {}
    let filesProcessed = 0
    let totalOriginalChars = 0
    let totalRoundedChars = 0

    // Process each SVG file
    for (let i = 1; i <= 79; i++) {
      const fileNum = i.toString().padStart(2, '0')
      const fileName = `${fileNum}.svg`
      const filePath = join(jackDir, fileName)

      try {
        const svgContent = readFileSync(filePath, 'utf-8')
        const pathD = extractPathData(svgContent)

        if (!pathD) {
          console.warn(`No path data found in ${fileName}`)
          continue
        }

        // Store original path data
        pathData[i] = pathD
        totalOriginalChars += pathD.length

        // Process and store rounded path data
        const roundedPathD = roundPathData(pathD)
        pathDataSm[i] = roundedPathD
        totalRoundedChars += roundedPathD.length

        // Create new SVG with rounded path
        const newSvgContent = svgContent.replace(/d="[^"]*"/, `d="${roundedPathD}"`)
        writeFileSync(join(smallDir, fileName), newSvgContent)

        filesProcessed++
        process.stdout.write(`Processing files: ${filesProcessed}/79\r`)
      } catch (error) {
        console.error(`Error processing ${fileName}:`, error)
      }
    }

    console.log('\nWriting JSON files...')

    const signaturesPath = join(baseDir, 'signatures.json')
    const signaturesSMPath = join(baseDir, 'signatures-sm.json')

    // Write JSON files
    writeFileSync(signaturesPath, JSON.stringify(pathData, null, 2))
    writeFileSync(signaturesSMPath, JSON.stringify(pathDataSm, null, 2))

    // Compare files
    compareFiles(signaturesPath, signaturesSMPath)

    // Path data statistics
    const avgCharReduction = ((totalOriginalChars - totalRoundedChars) / totalOriginalChars * 100).toFixed(2)
    console.log('\nPath data statistics:')
    console.log(`Average characters per path:`)
    console.log(`Original:           ${Math.round(totalOriginalChars / filesProcessed)}`)
    console.log(`Rounded:            ${Math.round(totalRoundedChars / filesProcessed)}`)
    console.log(`Character reduction: ${avgCharReduction}%`)

    console.log('\nFiles created:')
    console.log('- ./data/signatures.json')
    console.log('- ./data/signatures-sm.json')
    console.log(`- ${filesProcessed} SVG files in ./data/jack/sm/`)
  })
