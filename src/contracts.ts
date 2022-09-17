import type { Knex } from 'knex'

export interface PluginConfig {
  database: Knex.Config
}
