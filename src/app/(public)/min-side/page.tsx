'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/i18n/context'
import { BankIDButton } from '@/components/auth/BankIDButton'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { AppointmentWithPractitioner, SpecialtyType } from '@/types/database'

type Tab = 'upcoming' | 'past'

interface QRModal {
  appointmentId: string
  qrDataUrl: string | null
  qrToken: string | null
  loading: boolean
}

interface CancelState {
  appointmentId: string
  loading: boolean
  withinWindow: boolean | null  // null = not checked yet
}

function formatDate(dateStr: string, lang: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString(
    lang === 'no' ? 'nb-NO' : 'en-GB',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  )
}

function isUpcoming(appt: AppointmentWithPractitioner) {
  const apptDate = new Date(`${appt.appointment_date}T${appt.end_time}`)
  return apptDate >= new Date() && appt.status !== 'cancelled'
}

const statusColor: Record<string, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
  no_show:   'bg-orange-100 text-orange-700',
  arrived:   'bg-blue-100 text-blue-700',
}

export default function MinSidePage() {
  const { t, language } = useLanguage()
  const supabase = createClient()

  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [appointments, setAppointments] = useState<AppointmentWithPractitioner[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('upcoming')
  const [qrModal, setQrModal] = useState<QRModal | null>(null)
  const [cancelState, setCancelState] = useState<CancelState | null>(null)
  const [cancelError, setCancelError] = useState('')

  // Check for existing Supabase session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUserId(data.session.user.id)
        setUserEmail(data.session.user.email ?? data.session.user.id.slice(0, 8))
      } else {
        setLoading(false)
      }
    })
  }, [])

  const fetchAppointments = useCallback(async (uid: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/appointments?patientId=${uid}`)
      const data = await res.json()
      setAppointments(data.appointments ?? [])
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userId) fetchAppointments(userId)
  }, [userId, fetchAppointments])

  function handleBankIDSuccess(uid: string, email: string) {
    setUserId(uid)
    setUserEmail(email)
  }

  async function openQR(apptId: string) {
    setQrModal({ appointmentId: apptId, qrDataUrl: null, qrToken: null, loading: true })
    try {
      const res = await fetch(`/api/appointments/${apptId}`)
      const data = await res.json()
      setQrModal({
        appointmentId: apptId,
        qrDataUrl: data.appointment?.qrDataUrl ?? null,
        qrToken: data.appointment?.qr_token ?? null,
        loading: false,
      })
    } catch {
      setQrModal({ appointmentId: apptId, qrDataUrl: null, qrToken: null, loading: false })
    }
  }

  function startCancel(apptId: string) {
    setCancelState({ appointmentId: apptId, loading: false, withinWindow: null })
    setCancelError('')
  }

  async function confirmCancel() {
    if (!cancelState || !userId) return
    setCancelState((s) => s && ({ ...s, loading: true }))
    setCancelError('')

    try {
      const res = await fetch(`/api/appointments/${cancelState.appointmentId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Feil ved avbestilling')

      // Update local state
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === cancelState.appointmentId
            ? { ...a, status: 'cancelled', payment_status: data.refunded ? 'refunded' : a.payment_status }
            : a
        )
      )
      setCancelState(null)
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : t.common.error)
      setCancelState((s) => s && ({ ...s, loading: false }))
    }
  }

  const upcoming = appointments.filter(isUpcoming)
  const past = appointments.filter((a) => !isUpcoming(a))
  const shown = tab === 'upcoming' ? upcoming : past

  // ── Not logged in ──
  if (!userId && !loading) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#EBF3FD] flex items-center justify-center">
          <svg className="w-8 h-8 text-[#1A6BCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#111827] mb-2">{t.dashboard.title}</h1>
        <p className="text-[#6B7280] mb-8 text-sm leading-relaxed">
          {t.booking.loginRequired}
        </p>
        <BankIDButton
          onSuccess={handleBankIDSuccess}
          className="mx-auto"
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">{t.dashboard.title}</h1>
          {userEmail && (
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-[#6B7280]">{userEmail}</p>
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  setUserId(null)
                  setUserEmail('')
                  setAppointments([])
                }}
                className="text-xs text-[#9CA3AF] hover:text-[#6B7280] underline transition-colors"
              >
                {t.dashboard.switchAccount}
              </button>
            </div>
          )}
        </div>
        <Link href="/practitioners">
          <Button size="sm">{t.practitioner.bookCta}</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#F5F7FA] rounded-xl p-1 mb-6">
        {(['upcoming', 'past'] as Tab[]).map((t_) => (
          <button
            key={t_}
            onClick={() => setTab(t_)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              tab === t_
                ? 'bg-white text-[#111827] shadow-sm'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
          >
            {t_ === 'upcoming' ? t.dashboard.upcoming : t.dashboard.past}
            {t_ === 'upcoming' && upcoming.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-[#1A6BCC] text-white text-[10px] rounded-full">
                {upcoming.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E7EB] animate-pulse">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && shown.length === 0 && (
        <div className="text-center py-16">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#F5F7FA] flex items-center justify-center">
            <svg className="w-7 h-7 text-[#9CA3AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[#6B7280] text-sm">
            {tab === 'upcoming' ? t.dashboard.noUpcoming : t.dashboard.noPast}
          </p>
          {tab === 'upcoming' && (
            <Link href="/practitioners" className="mt-4 inline-block text-sm text-[#1A6BCC] hover:underline font-medium">
              {t.home.heroCta} →
            </Link>
          )}
        </div>
      )}

      {/* Appointment cards */}
      {!loading && shown.length > 0 && (
        <div className="space-y-3">
          {shown.map((appt) => {
            const canCancel = ['confirmed', 'pending'].includes(appt.status) && isUpcoming(appt)
            const apptDate = new Date(`${appt.appointment_date}T${appt.start_time}`)
            const hoursAway = (apptDate.getTime() - Date.now()) / (1000 * 60 * 60)
            const isWithin24h = hoursAway > 0 && hoursAway < 24

            return (
              <div
                key={appt.id}
                className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Card header */}
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#EBF3FD] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {appt.practitioners.photo_url ? (
                        <Image
                          src={appt.practitioners.photo_url}
                          alt={appt.practitioners.name}
                          width={48} height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <img
                          src={`/icons/specialty-${appt.practitioners.specialty.replace('_', '-')}.svg`}
                          alt={appt.practitioners.specialty}
                          width={24} height={24}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <h3 className="font-semibold text-[#111827] leading-tight">
                            {appt.practitioners.name}
                          </h3>
                          <Badge
                            variant="specialty"
                            type={appt.practitioners.specialty as SpecialtyType}
                            className="mt-1"
                          >
                            {t.specialty[appt.practitioners.specialty as SpecialtyType]}
                          </Badge>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${statusColor[appt.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {t.status[appt.status as keyof typeof t.status] ?? appt.status}
                        </span>
                      </div>

                      {/* Date + time */}
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                          <svg className="w-4 h-4 flex-shrink-0 text-[#1A6BCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="capitalize">{formatDate(appt.appointment_date, language)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                          <svg className="w-4 h-4 flex-shrink-0 text-[#1A6BCC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>kl. {appt.start_time.slice(0, 5)}–{appt.end_time.slice(0, 5)}</span>
                        </div>
                      </div>

                      {/* Payment row */}
                      {appt.amount_nok && (
                        <div className="mt-2 flex items-center gap-2 text-sm">
                          <div className="w-4 h-4 rounded bg-[#FF5B24] flex items-center justify-center flex-shrink-0">
                            <svg width="8" height="8" viewBox="0 0 12 12" fill="white">
                              <path d="M2 5L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                          </div>
                          <span className="text-[#6B7280]">
                            {(appt.amount_nok / 100).toFixed(0)} {t.common.nok} via Vipps
                            {appt.payment_status === 'refunded' && (
                              <span className="ml-1 text-orange-600 font-medium">({t.status.refunded})</span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Booking ID */}
                      <p className="mt-1 text-xs text-[#9CA3AF]">
                        #{appt.id.split('-')[0].toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card actions */}
                {(isUpcoming(appt) || appt.status === 'confirmed') && (
                  <div className="px-5 pb-4 flex flex-wrap items-center gap-2 border-t border-[#F5F7FA] pt-3">
                    {/* QR code button */}
                    <button
                      onClick={() => openQR(appt.id)}
                      className="flex items-center gap-1.5 text-sm text-[#1A6BCC] hover:text-[#1557A8] font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      {t.dashboard.showQr}
                    </button>

                    {/* iCal download */}
                    <a
                      href={`/api/appointments/${appt.id}/ical`}
                      download
                      className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#111827] font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t.confirmation.addToCalendar}
                    </a>

                    {/* Cancel */}
                    {canCancel && (
                      <button
                        onClick={() => startCancel(appt.id)}
                        className="ml-auto flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {t.dashboard.cancel}
                        {isWithin24h && (
                          <span className="text-[10px] font-semibold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">
                            &lt;24t
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setQrModal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-[#111827] mb-1">{t.confirmation.qrTitle}</h3>
            <p className="text-xs text-[#6B7280] mb-4">{t.confirmation.qrInstruction}</p>

            {qrModal.loading ? (
              <div className="w-48 h-48 mx-auto flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#1A6BCC] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : qrModal.qrDataUrl ? (
              <>
                <img
                  src={qrModal.qrDataUrl}
                  alt="QR code"
                  className="w-48 h-48 mx-auto"
                />
                {qrModal.qrToken && (
                  <div className="mt-3 px-4 py-2 bg-[#F5F7FA] rounded-xl">
                    <p className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-widest mb-0.5">
                      Innsjekk-kode
                    </p>
                    <p className="font-mono text-xl font-bold text-[#111827] tracking-widest">
                      {qrModal.qrToken}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-[#9CA3AF] py-8">Kunne ikke laste QR-kode</p>
            )}

            <button
              onClick={() => setQrModal(null)}
              className="mt-4 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              {t.common.close}
            </button>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => !cancelState.loading && setCancelState(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-[#111827] text-center mb-2">
              {t.dashboard.cancelConfirm}
            </h3>

            {/* 24h warning */}
            {(() => {
              const appt = appointments.find((a) => a.id === cancelState.appointmentId)
              if (!appt) return null
              const hoursAway = (new Date(`${appt.appointment_date}T${appt.start_time}`).getTime() - Date.now()) / (1000 * 60 * 60)
              return hoursAway > 0 && hoursAway < 24 ? (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4 text-sm text-orange-700 text-center">
                  {t.dashboard.cancelNoRefund}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-700 text-center">
                  {t.dashboard.cancelFreeUntil}
                </div>
              )
            })()}

            {cancelError && (
              <p className="text-red-600 text-sm text-center mb-3">{cancelError}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setCancelState(null)}
                disabled={cancelState.loading}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-[#6B7280] hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t.dashboard.keepAppointment}
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancelState.loading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelState.loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {t.dashboard.cancelAppointment}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
