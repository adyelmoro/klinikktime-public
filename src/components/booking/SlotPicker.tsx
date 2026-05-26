'use client'

import { useLanguage } from '@/i18n/context'
import type { TimeSlot } from '@/types/database'

interface SlotPickerProps {
  slots: TimeSlot[]
  selected: string | null
  onSelect: (startTime: string) => void
  loading?: boolean
}

export function SlotPicker({ slots, selected, onSelect, loading = false }: SlotPickerProps) {
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  const available = slots.filter((s) => s.available)

  if (available.length === 0) {
    return (
      <p className="text-sm text-[#6B7280] py-4 text-center">{t.practitioner.noSlots}</p>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => {
        const isSelected = selected === slot.startTime
        return (
          <button
            key={slot.startTime}
            disabled={!slot.available}
            onClick={() => slot.available && onSelect(slot.startTime)}
            className={`
              h-10 rounded-lg text-sm font-medium transition-all
              ${slot.available
                ? isSelected
                  ? 'bg-[#1A6BCC] text-white shadow-sm'
                  : 'bg-[#E8F1FB] text-[#1A6BCC] hover:bg-[#1A6BCC] hover:text-white'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed line-through'
              }
            `}
          >
            {slot.startTime}
          </button>
        )
      })}
    </div>
  )
}
