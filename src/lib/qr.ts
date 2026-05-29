import QRCode from 'qrcode'

export async function generateQRDataUrl(qrToken: string): Promise<string> {
  return QRCode.toDataURL(qrToken, {
    width: 256,
    margin: 2,
    color: { dark: '#111827', light: '#FFFFFF' },
  })
}

export async function generateQRBuffer(qrToken: string): Promise<Buffer> {
  return QRCode.toBuffer(qrToken, {
    width: 256,
    margin: 2,
  })
}
