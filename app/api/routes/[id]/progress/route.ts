import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { query } from '@/lib/snowflake'
import type { RouteProgress } from '@/types'

export const runtime = 'nodejs'

interface ProgressRow {
  DONE: number
  PENDING: number
  FAILED: number
  TOTAL: number
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { id } = await params

  const rows = await query<ProgressRow>(
    `SELECT
       COUNT_IF(STATUS = 'PROCESSED') AS DONE,
       COUNT_IF(STATUS = 'PENDING')   AS PENDING,
       COUNT_IF(STATUS = 'FAILED')    AS FAILED,
       COUNT(*)                        AS TOTAL
     FROM SUBMISSIONS
     WHERE ROUTE_ID = ? AND USER_ID = ?`,
    [id, userId],
  )
  const r = rows[0]

  const progress: RouteProgress = {
    done: r?.DONE ?? 0,
    pending: r?.PENDING ?? 0,
    failed: r?.FAILED ?? 0,
    total: r?.TOTAL ?? 0,
  }

  return NextResponse.json(progress)
}
