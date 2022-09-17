import { exec } from 'node:child_process'
import { hrtime } from 'node:process'
import { promisify } from 'node:util'
import ms from 'pretty-ms'

const execAsync = promisify(exec)
const hrstart = hrtime()

async function cleanUp() {
  await execAsync('rm -rf dist')
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
  await Promise.all([compileToESM(), compileToCJS(), generateTypescriptDefinitions()])

  const hrend = hrtime(hrstart)

  console.log('')
  console.log(`🚀 Build completed in ${ms(hrend[0] * 1000 + hrend[1] / 1000000)}`)
}

build()
