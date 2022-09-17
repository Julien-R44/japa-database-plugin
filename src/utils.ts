import type { Knex } from 'knex'

export class DatabaseUtils {
  private static connection: Knex

  /**
   * Set the Knex connection
   */
  public static setConnection(connection: Knex) {
    this.connection = connection
  }

  /**
   * List mysql tables
   */
  private static async listMysqlTables() {
    const query = `
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = ?
    `

    const result = await this.connection.raw(query, this.connection.client.database())
    return result[0].map((row: any) => row.TABLE_NAME)
  }

  /**
   * Returns a list of tables in the database
   */
  private static async listTables(): Promise<string[]> {
    let query = ''
    let bindings: string[] = []

    const client = this.connection.client.constructor.name

    if (client === 'Client_MySQL' || client === 'Client_MySQL2') {
      return this.listMysqlTables()
    }

    switch (client) {
      case 'Client_MSSQL':
        query =
          "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_catalog = ?"
        bindings = [this.connection.client.database()]
        break
      case 'Client_PG':
        query =
          'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?'
        bindings = [this.connection.client.database()]
        break
      case 'Client_SQLite3':
        query = "SELECT name AS table_name FROM sqlite_master WHERE type='table'"
        break
    }

    const result = await this.connection.raw(query, bindings)
    const rows = result.rows || result
    return rows.map((row: any) => row.table_name || row.TABLE_NAME)
  }

  /**
   * Truncate all tables in the database
   */
  public static async refreshDatabase() {
    const tableNames = await this.listTables()
    const truncations = tableNames.map((table) => this.connection.table(table).truncate())

    await Promise.all(truncations)
  }
}
