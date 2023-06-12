import { createRequire } from 'module'

/**
 * Check if a given module is installed
 */
const require = createRequire(import.meta.url)
export function isModuleInstalled(moduleName: string) {
  try {
    require.resolve(moduleName)
    return true
  } catch (error) {
    return false
  }
}
