<p align="center">
  <img src="https://user-images.githubusercontent.com/8337858/190878581-43ed9b9d-bf4a-47d2-9af0-b00b2e79027a.png">
</p>

# @julr/japa-database-plugin

This plugin for [Japa](http://japa.dev) provides some utility functions to make it easier for you to test a database. Built on top of [knex](https://knexjs.org/).

## Features
- Support Mysql, Sqlite, PostgreSQL, MSSQL
- Support expect, and assert

## Installation
```bash
pnpm install @julr/japa-database-plugin
```

## Configuration
The first step is to register the plugin in your Japa configuration : 

```ts
configure({
  ...processCliArgs(process.argv.slice(2)),
  ...{
    plugins: [
      expect(),
      database({ 
        database: {
          client: 'pg',
          connection: {
            host: 'localhost',
            user: 'japa',
            password: 'password',
            database: 'japa',
          }
        } 
      }),
    ],
    // ...
  },
})
```
You can find more information about the configuration of your database in the [knex documentation](https://knexjs.org/guide/#configuration-options)

## Usage

The plugin provides the DatabaseUtils class which you can use for refreshing the database between your tests :

```ts
import { DatabaseUtils } from '@julr/japa-database-plugin'

test.group('My tests', group => {
  group.each.teardown(async () => DatabaseUtils.refreshDatabase())

  // ...
})
```

This will truncate all tables in your database.

### Assertions

You can access the main object from the test context as follows :

```ts
test.group('My tests', group => {
  test('My test', async ({ database }) => {
    await database.assertHas('users', { email: 'jul@japa.com' })
  })
})
```

The plugin proposes the following assertions: 

```ts
test('My test', async ({ database }) => {
  await database.assertHas('users', { email: 'jul@japa.com' })
  await database.assertMissing('users', { email: 'shouldNotBe@inDatabase.com'})
  await database.assertHasCount('users', 5)
})
```

## License

[MIT](./LICENSE.md) License © 2022 [Julien Ripouteau](https://github.com/Julien-R44)

