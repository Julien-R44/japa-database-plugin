import type { Knex } from 'knex'
import type { Expect } from '@japa/expect'
import type { Assert } from '@japa/assert'

export class Database {
  private client: Knex
  private expect?: Expect
  private assert?: Assert

  constructor(connection: Knex, expect?: Expect, assert?: Assert) {
    this.client = connection
    this.expect = expect
    this.assert = assert
  }

  /***
   * Return the knex client
   */
  public connection() {
    return this.client
  }

  /**
   * Assert that the db contains the given data in the given table
   * If count is provided, then it will assert that X rows matching the data exists
   */
  public async assertHas(table: string, data: any, count?: number) {
    const result = await this.client.select('*').from(table).where(data)
    const isCountValid = count ? result.length === count : result.length >= 1

    if (this.expect) {
      this.expect(isCountValid).toBe(true)
    } else if (this.assert) {
      this.assert.isTrue(isCountValid)
    }
  }

  /**
   * Assert that the given table has the given number of rows
   */
  public async assertCount(table: string, count: number) {
    const result: any = await this.client.count({ count: '*' }).from(table)
    const countResult = +result[0].count

    if (this.expect) {
      this.expect(countResult).toBe(count)
    } else if (this.assert) {
      this.assert.isTrue(countResult === count)
    }
  }

  /**
   * Assert that this data does not exists in the given table
   */
  public async assertMissing(table: string, data: any) {
    const result = await this.client.select('*').from(table).where(data)

    if (this.expect) {
      this.expect(result).toHaveLength(0)
    } else if (this.assert) {
      this.assert.isTrue(result.length === 0)
    }
  }
}
