import knex from 'knex'
import { Database } from './database.js'
import { DatabaseUtils } from './utils.js'
import type { PluginConfig } from './contracts.js'
import type { PluginFn } from '@japa/runner'

export { DatabaseUtils }

/**
 * Augment the test context with the database instance
 */
declare module '@japa/runner' {
  interface TestContext {
    database: Database
  }
}

/**
 * Database plugin for Japa
 */
export function database(options: PluginConfig): PluginFn {
  const connection = knex(options.database)
  DatabaseUtils.setConnection(connection)

  return async function (config, __, { TestContext }) {
    let database: Database | null = null

    TestContext.getter(
      'database',
      function () {
        database = new Database(connection, this.expect, this.assert)
        return database
      },
      true
    )

    config.teardown.push(async () => connection.destroy())
  }
}
