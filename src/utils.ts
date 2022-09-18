import { dialects } from './dialects/index.js'
import type { DialectContract } from './dialects/index.js'
import type { Knex } from 'knex'

export class DatabaseUtils {
  private static client: string
  private static dialect: DialectContract

  /**
   * Set the Knex connection
   */
  public static setConnection(connection: Knex) {
    this.client = connection.client.constructor.name
    this.dialect = new dialects[this.client](connection)
  }

  /**
   * Returns a list of tables in the database
   */
  private static async listTables() {
    return this.dialect.listAllTables()
  }

  /**
   * Truncate all tables in the database
   */
  public static async refreshDatabase() {
    const tableNames = await this.listTables()
    await Promise.all(tableNames.map((table) => this.dialect.truncate(table)))
  }
}
