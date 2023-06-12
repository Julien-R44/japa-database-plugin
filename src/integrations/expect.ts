import { expect } from 'expect'
import { PluginContext } from '../context.js'
import type { MatcherFunction } from 'expect'

declare module 'expect' {
  interface Matchers<R> {
    toBeInTable(table: string, count?: number): Promise<R>
    toHaveCountInTable(table: string, count: number): Promise<R>
    toNotBeInTable(table: string): Promise<R>
  }
}

const toBeInTable: MatcherFunction<any> = async function (value: any, table: string, count = 1) {
  const pass = await PluginContext.database.assertHas(table, value, count)
  let message = ''

  if (!pass) {
    message = this.utils.matcherHint('toBeInTable', undefined, undefined)

    message += '\n\n'
    message +=
      `  Expected :\n    ${this.utils.printExpected(value)}\n` +
      `  to be in table \`${table}\` ${this.utils.printExpected(count)} times`
  }

  return {
    pass,
    message: () => message,
  }
}

const toHaveCountInTable: MatcherFunction<any> = async function (
  _value: any,
  table: string,
  count: number
) {
  const pass = await PluginContext.database.assertCount(table, count)

  let message = ''

  if (!pass) {
    message = this.utils.matcherHint('toHaveCountInTable', undefined, undefined)

    message += '\n\n'
    message +=
      `  Expected :\n    ${this.utils.printExpected(table)}\n` +
      `  to have ${this.utils.printExpected(count)} rows`
  }

  return {
    pass,
    message: () => message,
  }
}

const toNotBeInTable: MatcherFunction<any> = async function (value: any, table: string) {
  const pass = await PluginContext.database.assertMissing(table, value)
  let message = ''

  if (!pass) {
    message = this.utils.matcherHint('toNotBeInTable', undefined, undefined)

    message += '\n\n'
    message +=
      `  Expected :\n    ${this.utils.printExpected(value)}\n` + `  to not be in table \`${table}\``
  }

  return {
    pass,
    message: () => message,
  }
}

expect.extend({
  toBeInTable,
  toHaveCountInTable,
  toNotBeInTable,
})
