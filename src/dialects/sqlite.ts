import type { Knex } from 'knex'
import type { DialectContract } from './index.js'

export class Sqlite implements DialectContract {
  constructor(private connection: Knex) {}

  public async truncate(table: string) {
    await this.connection.table(table).truncate()
  }

  public async listAllTables() {
    const tables = await this.connection
      .from('sqlite_master')
      .select('name as table_name')
      .where('type', 'table')
      .whereNot('name', 'like', 'sqlite_%')
      .orderBy('name', 'asc')

    return tables.map(({ table_name }) => table_name)
  }
}
