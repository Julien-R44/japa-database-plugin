import knex from 'knex'
import type { Knex } from 'knex'

export function setupConnection() {
  const credentials = {
    host: 'localhost',
    user: 'japa',
    password: 'password',
    database: 'japa',
  }

  const connectionConfig: { [key: string]: Knex.Config } = {
    better_sqlite: { client: 'better-sqlite3', connection: { filename: ':memory:' } },
    sqlite: { client: 'sqlite', connection: { filename: ':memory:' } },
    mysql: { client: 'mysql2', connection: { ...credentials, port: 3306 } },
    postgres: { client: 'pg', connection: { ...credentials, port: 5432 } },
    mssql: { client: 'mssql', connection: { ...credentials, port: 1433 } },
  }

  return knex(connectionConfig[process.env.DB!])
}
