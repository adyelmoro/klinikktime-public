/**
 * Vipps Checkout flow simulation — Option C (production-ready interface).
 * This module implements the same interface as the real Vipps Checkout API.
 * Swapping in real credentials requires only env var changes — no code changes.
 *
 * Production path: register enkeltpersonforetak → get org nr → register at developer.vipps.no
 * → set real VIPPS_CLIENT_ID, VIPPS_CLIENT_SECRET, VIPPS_MERCHANT_SERIAL_NUMBER
 */

export interface VippsInitiateResult {
  orderId: string
  redirectUrl: string
}

export interface VippsCallbackPayload {
  orderId: string
  event: 'payment.completed' | 'payment.refunded' | 'payment.failed'
}

export function generateOrderId(): string {
  return `KT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
}

export function buildVippsRedirectUrl(orderId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  return `${baseUrl}/checkout/vipps-redirect?orderId=${orderId}`
}

export function buildCallbackUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  return `${baseUrl}/api/vipps/callback`
}
