import snowflake from 'snowflake-sdk'
import path from 'path'
import fs from 'fs'

let connection: snowflake.Connection | null = null
// Concurrent callers before the first connect() resolves must await the same in-flight promise —
// otherwise a second caller sees `connection` already assigned (createConnection() returns
// synchronously, before the handshake completes) and queries it while it's still connecting,
// throwing "Unable to perform operation because a connection was never established."
let connecting: Promise<snowflake.Connection> | null = null

async function getConnection(): Promise<snowflake.Connection> {
  if (connection) return connection
  if (connecting) return connecting

  connecting = (async () => {
    const opts: snowflake.ConnectionOptions = {
      account:   process.env.SNOWFLAKE_ACCOUNT!,
      username:  process.env.SNOWFLAKE_USER!,
      role:      process.env.SNOWFLAKE_ROLE,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE,
      database:  process.env.SNOWFLAKE_DATABASE,
      schema:    process.env.SNOWFLAKE_SCHEMA,
    }

    if (process.env.SNOWFLAKE_PRIVATE_KEY_PATH) {
      const keyPath = path.resolve(process.env.SNOWFLAKE_PRIVATE_KEY_PATH)
      opts.privateKey = fs.readFileSync(keyPath, 'utf8')
      opts.authenticator = 'SNOWFLAKE_JWT'
    } else {
      opts.password = process.env.SNOWFLAKE_PASSWORD
    }

    const conn = snowflake.createConnection(opts)

    await new Promise<void>((resolve, reject) => {
      conn.connect((err) => (err ? reject(err) : resolve()))
    })

    connection = conn
    return conn
  })()

  try {
    return await connecting
  } finally {
    connecting = null
  }
}

/**
 * snowflake-sdk's own `Bind` type is `string | number` only, but the driver accepts `null` at
 * runtime for nullable columns (e.g. optional GPS coords) — widen here rather than at every
 * call site that needs a nullable bind.
 */
export type QueryBind = snowflake.Bind | null

export async function query<T = Record<string, unknown>>(
  sqlText: string,
  binds: QueryBind[] = [],
): Promise<T[]> {
  const conn = await getConnection()
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText,
      binds: binds as snowflake.Bind[],
      complete: (err, _stmt, rows) => (err ? reject(err) : resolve((rows ?? []) as T[])),
    })
  })
}

/**
 * Bulk insert: one row per entry in `rows`. Uses snowflake-sdk's native array-of-arrays bind
 * form (`InsertBinds = Bind[][]`), which the driver sends as a single batched INSERT rather than
 * one round trip per row.
 */
export async function queryBatch(sqlText: string, rows: QueryBind[][]): Promise<void> {
  if (rows.length === 0) return
  const conn = await getConnection()
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText,
      binds: rows as unknown as snowflake.Bind[][],
      complete: (err) => (err ? reject(err) : resolve()),
    })
  })
}

/** PUT a local file to an internal stage. Path must be server-generated (no user input). */
export async function putFile(localPath: string, stageName: string): Promise<void> {
  const conn = await getConnection()
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText: `PUT file://${localPath} @${stageName} AUTO_COMPRESS=FALSE OVERWRITE=FALSE`,
      complete: (err) => (err ? reject(err) : resolve()),
    })
  })
}
