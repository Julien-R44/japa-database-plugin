import type { Knex } from 'knex'
import type { DialectContract } from './index.js'

export class Mssql implements DialectContract {
  constructor(private connection: Knex) {}

  /**
   * Truncate mssql table. Disabling foreign key constriants alone is
   * not enough for SQL server.
   *
   * One has to drop all FK constraints and then re-create them, and
   * this all is too much work
   */
  public async truncate(table: string) {
    return this.connection.table(table).truncate()
  }

  public async listAllTables() {
    const query = `
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_catalog = ?"
    `
    const result = await this.connection.raw(query, [this.connection.client.database()])
    const rows = result.rows || result
    return rows.map((row: any) => row.table_name || row.TABLE_NAME)
  }
}
