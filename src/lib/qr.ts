import QRCode from 'qrcode'

export async function generateQRDataUrl(qrToken: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  return QRCode.toDataURL(`${baseUrl}/admin/checkin?token=${qrToken}`, {
    width: 256,
    margin: 2,
    color: { dark: '#111827', light: '#FFFFFF' },
  })
}

export async function generateQRBuffer(qrToken: string): Promise<Buffer> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  return QRCode.toBuffer(`${baseUrl}/admin/checkin?token=${qrToken}`, {
    width: 256,
    margin: 2,
  })
}
