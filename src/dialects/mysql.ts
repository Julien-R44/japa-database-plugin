import type { Knex } from 'knex'
import type { DialectContract } from './index.js'

export class Mysql implements DialectContract {
  constructor(private connection: Knex) {}

  public async truncate(table: string) {
    const trx = await this.connection.transaction()
    try {
      await trx.raw('SET FOREIGN_KEY_CHECKS=0;')
      await trx.table(table).truncate()
      await trx.raw('SET FOREIGN_KEY_CHECKS=1;')
      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  public async listAllTables() {
    const query = `
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = ?
    `

    const result = await this.connection.raw(query, this.connection.client.database())
    return result[0].map((row: any) => row.TABLE_NAME)
  }
}
