import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/auth'
import { query, putFile } from '@/lib/snowflake'
import { randomUUID } from 'crypto'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import path from 'path'
import type { LeaderboardRow } from '@/types'

export const runtime = 'nodejs'

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES    = 10 * 1024 * 1024 // 10 MB

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const formData = await req.formData().catch(() => null)
  const file     = formData?.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File exceeds 10 MB' }, { status: 413 })
  }

  const ext      = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const fileName = `${randomUUID()}.${ext}`
  const tmpPath  = path.join(tmpdir(), fileName)

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(tmpPath, buffer)

    // Capture tier before processing so we can detect a tier-up after
    const beforeRows = await query<LeaderboardRow>(
      `SELECT * FROM LEADERBOARD_VIEW WHERE USER_ID = ?`,
      [userId],
    )
    const tierBefore = beforeRows[0]?.MEDAL_TIER ?? null

    // PUT to internal stage, insert PENDING row, run procedure
    await putFile(tmpPath, 'dashcam_media')

    await query(
      `INSERT INTO SUBMISSIONS (USER_ID, FILE_NAME, STATUS) VALUES (?, ?, 'PENDING')`,
      [userId, fileName],
    )

    await query(`CALL PROCESS_PENDING_SUBMISSIONS()`)

    // Fetch the result row for this file
    const subRows = await query<{ SUBMISSION_ID: string; STATUS: string; HAZARD_TYPE: string }>(
      `SELECT SUBMISSION_ID, STATUS, HAZARD_TYPE
       FROM SUBMISSIONS WHERE FILE_NAME = ? AND USER_ID = ?`,
      [fileName, userId],
    )
    const sub = subRows[0]

    // Fetch updated user stats
    const userRows = await query<LeaderboardRow>(
      `SELECT * FROM LEADERBOARD_VIEW WHERE USER_ID = ?`,
      [userId],
    )
    const u = userRows[0]

    return NextResponse.json({
      submission: {
        id:          sub?.SUBMISSION_ID ?? null,
        status:      sub?.STATUS ?? 'PROCESSED',
        hazardType:  sub?.HAZARD_TYPE ?? null,
      },
      user: {
        points:             u.POINTS,
        medalTier:          u.MEDAL_TIER,
        nextTierThreshold:  u.NEXT_TIER_THRESHOLD,
        progressPercentage: u.PROGRESS_PERCENTAGE,
        tierChanged:        tierBefore !== null && tierBefore !== u.MEDAL_TIER,
      },
    })
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    await unlink(tmpPath).catch(() => null)
  }
}
