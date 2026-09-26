import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const COOKIE_NAME = 'hh_user_id'

export async function getUserId(): Promise<string | undefined> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value
}

export function attachUserId(response: NextResponse, userId: string): NextResponse {
  response.cookies.set(COOKIE_NAME, userId, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  })
  return response
}
