import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/snowflake'
import { attachUserId } from '@/lib/auth'

export const runtime = 'nodejs'

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const username: string = body?.username ?? ''

  if (!USERNAME_RE.test(username)) {
    return NextResponse.json(
      { error: 'Username must be 3–20 characters: letters, numbers, underscores only' },
      { status: 400 },
    )
  }

  try {
    // Upsert user — Snowflake doesn't enforce UNIQUE so we MERGE
    await query(
      `MERGE INTO USERS u
       USING (SELECT ? AS USERNAME) s ON u.USERNAME = s.USERNAME
       WHEN NOT MATCHED THEN INSERT (USERNAME) VALUES (s.USERNAME)`,
      [username],
    )

    const rows = await query<{ USER_ID: string; USERNAME: string }>(
      `SELECT USER_ID, USERNAME FROM USERS WHERE USERNAME = ?`,
      [username],
    )

    if (!rows.length) {
      return NextResponse.json({ error: 'User not found after upsert' }, { status: 500 })
    }

    const { USER_ID: userId } = rows[0]
    const response = NextResponse.json({ userId, username })
    return attachUserId(response, userId)
  } catch (err) {
    console.error('[POST /api/login]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
