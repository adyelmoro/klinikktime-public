'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/i18n/context'
import { SlotPicker } from './SlotPicker'
import type { TimeSlot } from '@/types/database'

interface AvailabilityCalendarProps {
  practitionerId: string
  onSlotSelect: (date: string, startTime: string) => void
}

const DAYS_NO = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn']
const DAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS_NO = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember']
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function toDateString(date: Date): string {
  // Use local date parts — toISOString() gives UTC which shifts the date
  // backward by 1 day for Norwegian users (UTC+2)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1 // convert Sun=0 to Mon=0
}

export function AvailabilityCalendar({ practitionerId, onSlotSelect }: AvailabilityCalendarProps) {
  const { language } = useLanguage()
  const today = new Date()

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const days = language === 'no' ? DAYS_NO : DAYS_EN
  const months = language === 'no' ? MONTHS_NO : MONTHS_EN

  const fetchSlots = useCallback(async (date: string) => {
    setLoadingSlots(true)
    setSlots([])
    try {
      const res = await fetch(`/api/availability/${practitionerId}?date=${date}`)
      const data = await res.json()
      setSlots(data.slots ?? [])
    } catch {
      setSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }, [practitionerId])

  useEffect(() => {
    if (selectedDate) fetchSlots(selectedDate)
  }, [selectedDate, fetchSlots])

  function handleDayClick(day: number) {
    const date = new Date(viewYear, viewMonth, day)
    if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) return
    const dateStr = toDateString(date)
    setSelectedDate(dateStr)
    setSelectedSlot(null)
  }

  function handleSlotSelect(startTime: string) {
    setSelectedSlot(startTime)
    if (selectedDate) onSlotSelect(selectedDate, startTime)
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
    setSelectedDate(null)
    setSelectedSlot(null)
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
    setSelectedDate(null)
    setSelectedSlot(null)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const todayStr = toDateString(today)

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-[#F5F7FA] transition-colors text-[#6B7280]"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="font-semibold text-[#111827]">
          {months[viewMonth]} {viewYear}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-[#F5F7FA] transition-colors text-[#6B7280]"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-[#6B7280] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(viewYear, viewMonth, day)
          const dateStr = toDateString(date)
          const isPast = dateStr < todayStr
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const isWeekend = date.getDay() === 0 || date.getDay() === 6

          return (
            <button
              key={day}
              onClick={() => !isPast && handleDayClick(day)}
              disabled={isPast || isWeekend}
              className={`
                h-9 w-full rounded-lg text-sm font-medium transition-all
                ${isPast || isWeekend
                  ? 'text-gray-300 cursor-not-allowed'
                  : isSelected
                    ? 'bg-[#1A6BCC] text-white shadow-sm'
                    : isToday
                      ? 'border-2 border-[#1A6BCC] text-[#1A6BCC] hover:bg-[#E8F1FB]'
                      : 'text-[#111827] hover:bg-[#E8F1FB]'
                }
              `}
            >
              {day}
            </button>
          )
        })}
      </div>

      {/* Slot picker */}
      {selectedDate && (
        <div className="pt-4 border-t border-[#E5E7EB]">
          <p className="text-sm font-medium text-[#111827] mb-3">
            {language === 'no' ? 'Ledige tider' : 'Available slots'} —{' '}
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString(
              language === 'no' ? 'nb-NO' : 'en-GB',
              { weekday: 'long', day: 'numeric', month: 'long' }
            )}
          </p>
          <SlotPicker
            slots={slots}
            selected={selectedSlot}
            onSelect={handleSlotSelect}
            loading={loadingSlots}
          />
        </div>
      )}
    </div>
  )
}
