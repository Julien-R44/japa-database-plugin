import type { Database } from '../database.js'

declare module 'expect' {
  interface Matchers<R> {
    toBeInTable(table: string, count?: number): Promise<R>
    toHaveCountInTable(table: string, count: number): Promise<R>
    toNotBeInTable(table: string): Promise<R>
  }
}

/**
 * Augment the test context with the database instance
 */
declare module '@japa/runner' {
  interface TestContext {
    database: Database
  }
}
