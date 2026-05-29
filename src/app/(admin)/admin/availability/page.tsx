'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Template {
  id: string
  practitioner_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
  practitioners: { id: string; name: string; specialty: string }
}

interface Practitioner {
  id: string
  name: string
  specialty: string
}

const DAY_NAMES = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag']
const DAY_NAMES_SHORT = ['Søn', 'Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør']

function SortableTemplateRow({
  template, onDelete, onToggle,
}: {
  template: Template
  onDelete: (id: string) => void
  onToggle: (id: string, active: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: template.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl hover:border-[#C8DCF5] transition-colors"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-[#D1D5DB] hover:text-[#9CA3AF] cursor-grab active:cursor-grabbing flex-shrink-0"
        aria-label="Dra for å sortere"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" /><circle cx="11" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" /><circle cx="11" cy="12" r="1.5" />
        </svg>
      </button>

      {/* Day badge */}
      <span className="w-8 text-center text-xs font-bold text-[#1A6BCC] bg-[#EBF3FD] rounded-lg py-1 flex-shrink-0">
        {DAY_NAMES_SHORT[template.day_of_week]}
      </span>

      {/* Time range */}
      <span className="font-mono text-sm text-[#374151] flex-1">
        {template.start_time.slice(0, 5)} – {template.end_time.slice(0, 5)}
      </span>

      {/* Active toggle */}
      <button
        onClick={() => onToggle(template.id, !template.is_active)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
          template.is_active ? 'bg-[#1A6BCC]' : 'bg-[#D1D5DB]'
        }`}
      >
        <span
          className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform mt-0.5"
          style={{ transform: `translateX(${template.is_active ? '18px' : '2px'})` }}
        />
      </button>
      <span className="text-xs text-[#9CA3AF] w-14 flex-shrink-0">
        {template.is_active ? 'Aktiv' : 'Inaktiv'}
      </span>

      {/* Delete */}
      <button
        onClick={() => onDelete(template.id)}
        className="text-[#D1D5DB] hover:text-red-500 transition-colors flex-shrink-0"
        aria-label="Slett"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

export default function AdminAvailabilityPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [practitioners, setPractitioners] = useState<Practitioner[]>([])
  const [selectedPractId, setSelectedPractId] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newDay, setNewDay] = useState('1')
  const [newStart, setNewStart] = useState('08:00')
  const [newEnd, setNewEnd] = useState('16:00')

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/availability')
    const data = await res.json()
    const items: Template[] = data.templates ?? []
    setTemplates(items)

    // Extract unique practitioners
    const seen = new Set<string>()
    const practList: Practitioner[] = []
    items.forEach((t) => {
      if (t.practitioners && !seen.has(t.practitioners.id)) {
        seen.add(t.practitioners.id)
        practList.push(t.practitioners)
      }
    })
    practList.sort((a, b) => a.name.localeCompare(b.name))
    setPractitioners(practList)
    if (!selectedPractId && practList.length > 0) setSelectedPractId(practList[0].id)
    setLoading(false)
  }, [selectedPractId])

  useEffect(() => { fetchTemplates() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const practTemplates = templates.filter((t) => t.practitioner_id === selectedPractId)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setTemplates((items) => {
      // Only reorder within the current practitioner's templates
      const practItems = items.filter((t) => t.practitioner_id === selectedPractId)
      const others = items.filter((t) => t.practitioner_id !== selectedPractId)
      const oldIdx = practItems.findIndex((t) => t.id === active.id)
      const newIdx = practItems.findIndex((t) => t.id === over.id)
      return [...others, ...arrayMove(practItems, oldIdx, newIdx)]
    })
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/availability/${id}`, { method: 'DELETE' })
    setTemplates((prev) => prev.filter((t) => t.id !== id))
  }

  async function handleToggle(id: string, active: boolean) {
    await fetch(`/api/admin/availability/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: active }),
    })
    setTemplates((prev) => prev.map((t) => t.id === id ? { ...t, is_active: active } : t))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    const res = await fetch('/api/admin/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        practitioner_id: selectedPractId,
        day_of_week: parseInt(newDay),
        start_time: newStart,
        end_time: newEnd,
      }),
    })
    const data = await res.json()
    if (data.template) {
      const selectedPract = practitioners.find((p) => p.id === selectedPractId)
      setTemplates((prev) => [...prev, { ...data.template, practitioners: selectedPract! }])
    }
    setAdding(false)
  }

  const selectedPractName = practitioners.find((p) => p.id === selectedPractId)?.name ?? ''

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Tilgjengelighet</h1>
        <p className="text-sm text-[#6B7280] mt-0.5">Administrer arbeidstider per behandler · Dra for å sortere</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Practitioner list */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 h-fit">
          <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-3 px-1">Behandlere</p>
          <div className="space-y-1">
            {loading ? (
              <div className="py-4 flex justify-center">
                <div className="w-5 h-5 border-2 border-[#1A6BCC] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : practitioners.map((p) => {
              const count = templates.filter((t) => t.practitioner_id === p.id).length
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPractId(p.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                    selectedPractId === p.id
                      ? 'bg-[#EBF3FD] text-[#1A6BCC]'
                      : 'text-[#374151] hover:bg-[#F5F7FA]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      selectedPractId === p.id ? 'bg-[#1A6BCC]/10 text-[#1A6BCC]' : 'bg-[#F3F4F6] text-[#9CA3AF]'
                    }`}>
                      {count}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Templates for selected practitioner */}
        <div>
          {selectedPractId && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[#111827]">
                  {selectedPractName} — {practTemplates.length} maler
                </h2>
              </div>

              {/* Template list with DnD */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={practTemplates.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 mb-4">
                    {practTemplates.length === 0 ? (
                      <div className="text-center py-8 text-[#9CA3AF] text-sm bg-white rounded-xl border border-dashed border-[#E5E7EB]">
                        Ingen maler enda — legg til en nedenfor
                      </div>
                    ) : practTemplates.map((template) => (
                      <SortableTemplateRow
                        key={template.id}
                        template={template}
                        onDelete={handleDelete}
                        onToggle={handleToggle}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Add template form */}
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
                <p className="text-sm font-semibold text-[#111827] mb-4">Legg til ny mal</p>
                <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1">Dag</label>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value)}
                      className="px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6BCC]/30 focus:border-[#1A6BCC] bg-white"
                    >
                      {[1,2,3,4,5].map((d) => (
                        <option key={d} value={d}>{DAY_NAMES[d]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1">Fra</label>
                    <input
                      type="time"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6BCC]/30 focus:border-[#1A6BCC]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1">Til</label>
                    <input
                      type="time"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="px-3 py-2 border border-[#D1D5DB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6BCC]/30 focus:border-[#1A6BCC]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={adding}
                    className="px-4 py-2 bg-[#1A6BCC] text-white text-sm font-semibold rounded-lg hover:bg-[#1558A8] transition-colors disabled:opacity-50 min-h-[38px]"
                  >
                    {adding ? 'Legger til...' : '+ Legg til'}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
