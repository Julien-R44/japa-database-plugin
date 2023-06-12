import { PluginContext } from './context.js'
import type { Knex } from 'knex'

export class Database {
  private client: Knex

  constructor(connection: Knex) {
    this.client = connection
  }

  /***
   * Return the knex client
   */
  public connection() {
    return this.client
  }

  private get expect() {
    // @ts-expect-error
    return PluginContext.currentTestContext?.expect
  }

  private get assert() {
    // @ts-expect-error
    return PluginContext.currentTestContext?.assert
  }

  /**
   * Assert that the db contains the given data in the given table
   * If count is provided, then it will assert that X rows matching the data exists
   */
  public async assertHas(table: string, data: any, count?: number, checkAssert: boolean = true) {
    const result = await this.client.select('*').from(table).where(data)
    const isCountValid = count ? result.length === count : result.length >= 1

    if (checkAssert) {
      if (this.expect) {
        this.expect(isCountValid).toBe(true)
      } else if (this.assert) {
        this.assert.isTrue(isCountValid)
      }
    }

    return isCountValid
  }

  /**
   * Assert that the given table has the given number of rows
   */
  public async assertCount(table: string, count: number, checkAssert: boolean = true) {
    const result: any = await this.client.count({ count: '*' }).from(table)
    const countResult = +result[0].count

    if (checkAssert) {
      if (this.expect) {
        this.expect(countResult).toBe(count)
      } else if (this.assert) {
        this.assert.isTrue(countResult === count)
      }
    }

    return countResult === count
  }

  /**
   * Assert that this data does not exists in the given table
   */
  public async assertMissing(table: string, data: any, checkAssert: boolean = true) {
    const result = await this.client.select('*').from(table).where(data)

    if (checkAssert) {
      if (this.expect) {
        this.expect(result).toHaveLength(0)
      } else if (this.assert) {
        this.assert.isTrue(result.length === 0)
      }
    }

    return result.length === 0
  }
}
