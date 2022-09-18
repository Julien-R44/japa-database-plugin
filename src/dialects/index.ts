import { Mysql } from './mysql.js'
import { Pg } from './pg.js'
import { Sqlite } from './sqlite.js'
import { Mssql } from './mssql.js'
import type { Knex } from 'knex'

export interface DialectContract {
  truncate(table: string): Promise<void>
  listAllTables(): Promise<string[]>
}

export const dialects: {
  [key: string]: new (connection: Knex) => DialectContract
} = {
  Client_MySQL: Mysql,
  Client_MySQL2: Mysql,
  Client_PG: Pg,
  Client_SQLite3: Sqlite,
  Client_BetterSQLite3: Sqlite,
  Client_MSSQL: Mssql,
}
