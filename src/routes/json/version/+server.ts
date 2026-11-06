import { json } from '@sveltejs/kit'

export function GET() {
  return json({
    Browser: 'RUPAQ Preview',
    'Protocol-Version': '1.3',
    'User-Agent': 'RUPAQ Preview',
  })
}
