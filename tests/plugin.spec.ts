/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { TestContext, test } from '@japa/runner'
import { DatabaseUtils } from '../src/utils.js'
import { Database } from '../src/database.js'
import { setupConnection } from '../tests-helpers/index.js'
import { PluginContext } from '../src/context.js'

const connection = setupConnection()
DatabaseUtils.setConnection(connection)

const getTableCount = async (table: string) => {
  const result = await connection.count({ count: '*' }).from(table)
  return +result[0].count!
}

TestContext.created((ctx) => PluginContext.setCurrentTestContext(ctx))

test.group('Plugin', (group) => {
  group.setup(async () => {
    await connection.schema.createTable('users', (table) => {
      table.increments('id')
      table.string('name')
    })
    await connection.schema.createTable('posts', (table) => table.increments('id'))
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

  test('assertCount', async ({ assert }) => {
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

  test('assertHas', async ({ assert }) => {
    await connection.table('users').insert({ id: 1 })
    await connection.table('posts').insert({ id: 1 })

    const db = new Database(connection)

    await db.assertHas('users', { id: 1 })
    await db.assertHas('posts', { id: 1 })

    await DatabaseUtils.refreshDatabase()

    await db.assertMissing('users', { id: 1 })
    await db.assertMissing('posts', { id: 1 })
  })

  test('assertHas with count', async ({ assert }) => {
    await connection.table('users').insert({ name: 'bonjour' })
    await connection.table('users').insert({ name: 'bonjour' })

    const db = new Database(connection)

    await db.assertHas('users', { name: 'bonjour' }, 2)
    assert.rejects(async () => {
      await db.assertHas('users', { name: 'bonjour' }, 3)
    })
  })
})
