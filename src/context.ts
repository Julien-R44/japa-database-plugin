import knex from 'knex'
import { Database } from './database.js'
import { DatabaseUtils } from './utils.js'
import type { Knex } from 'knex'
import type { TestContext } from '@japa/runner'
import type { PluginConfig } from './contracts'

export class PluginContext {
  static currentTestContext: TestContext | null
  static database: Database
  static connection: Knex

  static init(options: PluginConfig) {
    const connection = knex(options.database)
    DatabaseUtils.setConnection(connection)

    this.database = new Database(connection)
  }

  static setCurrentTestContext(testContext: TestContext) {
    this.currentTestContext = testContext
  }
}
