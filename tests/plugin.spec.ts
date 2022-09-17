/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { test } from '@japa/runner'
import knex from 'knex'
import { DatabaseUtils } from '../src/utils.js'
import { Database } from '../src/database.js'
import type { Knex } from 'knex'

const credentials = {
  host: 'localhost',
  user: 'japa',
  password: 'password',
  database: 'japa',
}

const connectionConfig: { [key: string]: Knex.Config } = {
  sqlite: { client: 'sqlite', connection: { filename: ':memory:' } },
  mysql: { client: 'mysql2', connection: { ...credentials, port: 3306 } },
  postgres: { client: 'pg', connection: { ...credentials, port: 5432 } },
  mssql: { client: 'mssql', connection: { ...credentials, port: 1433 } },
}

const connection = knex(connectionConfig[process.env.DB!])
DatabaseUtils.setConnection(connection)

const getTableCount = async (table: string) => {
  const result = await connection.count({ count: '*' }).from(table)
  return +result[0].count!
}

test.group('Plugin', (group) => {
  group.setup(async () => {
    await connection.schema.createTable('users', (table) => {
      table.increments('id')
    })
    await connection.schema.createTable('posts', (table) => {
      table.increments('id')
    })
  })

  group.teardown(async () => {
    await connection.schema.dropTable('users')
    await connection.schema.dropTable('posts')
    await connection.destroy()
  })

  test('List all tables', async ({ assert }) => {
    // @ts-ignore
    const res = await DatabaseUtils.listTables()

    assert.include(res, 'users')
    assert.include(res, 'posts')
  })

  test('Refresh database', async ({ assert }) => {
    await connection.table('users').insert({})
    await connection.table('posts').insert({})
    await connection.table('users').insert({})
    await connection.table('posts').insert({})

    assert.deepEqual(await getTableCount('users'), 2)
    assert.deepEqual(await getTableCount('posts'), 2)

    await DatabaseUtils.refreshDatabase()

    assert.deepEqual(await getTableCount('users'), 0)
    assert.deepEqual(await getTableCount('posts'), 0)
  })

  test('assertCount', async () => {
    await connection.table('users').insert({})
    await connection.table('posts').insert({})
    await connection.table('users').insert({})
    await connection.table('posts').insert({})

    const db = new Database(connection)

    await db.assertCount('users', 2)
    await db.assertCount('posts', 2)

    await DatabaseUtils.refreshDatabase()

    await db.assertCount('users', 0)
    await db.assertCount('posts', 0)
  })

  test('assertHas', async () => {
    await connection.table('users').insert({ id: 1 })
    await connection.table('posts').insert({ id: 1 })

    const db = new Database(connection)

    await db.assertHas('users', { id: 1 })
    await db.assertHas('posts', { id: 1 })

    await DatabaseUtils.refreshDatabase()

    await db.assertMissing('users', { id: 1 })
    await db.assertMissing('posts', { id: 1 })
  })
})
