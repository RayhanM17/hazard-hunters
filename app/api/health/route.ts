import { NextResponse } from 'next/server'
import { query } from '@/lib/snowflake'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const rows = await query<{ VERSION: string }>(
      `SELECT CURRENT_VERSION() AS VERSION, CURRENT_DATABASE() AS DB, CURRENT_SCHEMA() AS SCHEMA, CURRENT_WAREHOUSE() AS WAREHOUSE`,
    )
    return NextResponse.json({ ok: true, snowflake: rows[0] })
  } catch (err) {
    console.error('[GET /api/health]', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    )
  }
}
