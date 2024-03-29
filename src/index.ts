import { DatabaseUtils } from './utils.js'
import { PluginContext } from './context.js'
import { isModuleInstalled } from './utils/index.js'
import type { PluginConfig } from './contracts.js'
import type { PluginFn } from '@japa/runner'

import './types/extended.js'

export { DatabaseUtils }

/**
 * Database plugin for Japa
 */
export function database(options: PluginConfig): PluginFn {
  PluginContext.init(options)

  return async function (config, __, { TestContext }) {
    TestContext.created((ctx) => PluginContext.setCurrentTestContext(ctx))

    if (isModuleInstalled('@japa/expect')) {
      await import('./integrations/expect.js')
    }

    TestContext.getter('database', () => PluginContext.database, true)

    config.teardown.push(async () => {
      await PluginContext.connection.destroy()
    })
  }
}
