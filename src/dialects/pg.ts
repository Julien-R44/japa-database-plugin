import type { Knex } from 'knex'
import type { DialectContract } from './index.js'

export class Pg implements DialectContract {
  constructor(private connection: Knex) {}

  public async truncate(table: string) {
    await this.connection.raw(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`)
  }

  public async listAllTables() {
    const tables = await this.connection
      .from('pg_catalog.pg_tables')
      .select('tablename as table_name')
      .whereIn('schemaname', ['public'])
      .orderBy('tablename', 'asc')

    return tables.map(({ table_name }) => table_name)
  }
}
