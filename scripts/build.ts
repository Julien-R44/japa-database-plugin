import { exec } from 'node:child_process'
import { access } from 'node:fs/promises'
import { join } from 'node:path'
import { hrtime } from 'node:process'
import { promisify } from 'node:util'
import ms from 'pretty-ms'
import pkg from '../package.json' assert { type: 'json' }

const execAsync = promisify(exec)
const hrstart = hrtime()

async function cleanUp() {
  await execAsync('rm -rf dist')
}

async function checkEntryPoint(path: string) {
  try {
    await access(join(path))
  } catch (error) {
    console.error(`❌ Entry point ${path} seems to be missing from your build folder.`)
    process.exit(1)
  }
}

async function compileToESM() {
  await execAsync('pnpm tsc --outDir dist/esm --declaration false')
  console.log('✅ Compiled to ESM')
}

async function compileToCJS() {
  await execAsync('pnpm tsc --outDir dist/cjs --module commonjs --declaration false')
  console.log('✅ Compiled to CJS')
}

async function generateTypescriptDefinitions() {
  await execAsync('pnpm tsc --emitDeclarationOnly --outDir dist/types')
  console.log('✅ Generated typescript definitions')
}

async function build() {
  await cleanUp()
  await Promise.all([compileToESM() /*compileToCJS()*/, , generateTypescriptDefinitions()])

  console.log('')

  await Promise.all([
    checkEntryPoint(pkg.main),
    checkEntryPoint(pkg.module),
    checkEntryPoint(pkg.types),
  ])

  const hrend = hrtime(hrstart)

  console.log(`🚀 Build completed in ${ms(hrend[0] * 1000 + hrend[1] / 1000000)}`)
}

build()
