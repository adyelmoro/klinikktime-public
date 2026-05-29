import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  const img = readFileSync(join(process.cwd(), 'public/favicon.png'))
  const base64 = `data:image/png;base64,${img.toString('base64')}`

  return new ImageResponse(
    <img src={base64} width={32} height={32} style={{ borderRadius: '0px' }} />,
    { width: 32, height: 32 }
  )
}
