import DrawClient from './DrawClient'

export const metadata = {
  title: 'Draw — DEWDS',
  description: 'Doodle on a blank canvas with the pen cursor.',
}

// Drawing canvas is interactive; render it client-side only.
export const dynamic = 'force-dynamic'

export default function DrawPage() {
  return <DrawClient />
}
