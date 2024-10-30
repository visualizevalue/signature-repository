import { task } from 'hardhat/config'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

interface PathData {
  [key: string]: string
}

function roundToInteger(numStr: string): string {
  return Math.round(parseFloat(numStr)).toString()
}

function roundPathData(pathD: string): string {
  // Match all numbers (including decimals) in the path
  return pathD.replace(/[-+]?[0-9]*\.?[0-9]+/g, roundToInteger)
}

function extractPathData(svgContent: string): string {
  const match = svgContent.match(/d="([^"]*)"/)
  return match ? match[1] : ''
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
        pathData[fileNum] = pathD

        // Process and store rounded path data
        const roundedPathD = roundPathData(pathD)
        pathDataSm[fileNum] = roundedPathD

        // Create new SVG with rounded path
        const newSvgContent = svgContent.replace(/d="[^"]*"/, `d="${roundedPathD}"`)
        writeFileSync(join(smallDir, fileName), newSvgContent)

        console.log(`Processed ${fileName}`)
      } catch (error) {
        console.error(`Error processing ${fileName}:`, error)
      }
    }

    // Write JSON files
    writeFileSync(
      join(baseDir, 'signatures.json'),
      JSON.stringify(pathData, null, 2)
    )
    writeFileSync(
      join(baseDir, 'signatures-sm.json'),
      JSON.stringify(pathDataSm, null, 2)
    )

    console.log('\nProcessing complete!')
    console.log('Created:')
    console.log('- ./data/signatures.json')
    console.log('- ./data/signatures-sm.json')
    console.log('- ./data/jack/sm/*.svg files')
  })
