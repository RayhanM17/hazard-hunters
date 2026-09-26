import snowflake from 'snowflake-sdk'
import path from 'path'
import fs from 'fs'

let connection: snowflake.Connection | null = null

async function getConnection(): Promise<snowflake.Connection> {
  if (connection) return connection

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

  connection = snowflake.createConnection(opts)

  await new Promise<void>((resolve, reject) => {
    connection!.connect((err) => (err ? reject(err) : resolve()))
  })

  return connection
}

export async function query<T = Record<string, unknown>>(
  sqlText: string,
  binds: unknown[] = [],
): Promise<T[]> {
  const conn = await getConnection()
  return new Promise((resolve, reject) => {
    conn.execute({
      sqlText,
      binds,
      complete: (err, _stmt, rows) => (err ? reject(err) : resolve((rows ?? []) as T[])),
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
