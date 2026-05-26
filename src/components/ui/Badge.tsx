import type { AppointmentStatus, PaymentStatus, SpecialtyType } from '@/types/database'

const specialtyColors: Record<SpecialtyType, string> = {
  physio:          'bg-blue-100 text-blue-800',
  psychology:      'bg-purple-100 text-purple-800',
  sports_medicine: 'bg-green-100 text-green-800',
  nutritionist:    'bg-orange-100 text-orange-800',
  private_gp:      'bg-gray-100 text-gray-800',
}

const statusColors: Record<AppointmentStatus, string> = {
  pending:   'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-600',
  no_show:   'bg-red-100 text-red-800',
  arrived:   'bg-green-100 text-green-800',
}

const paymentColors: Record<PaymentStatus, string> = {
  pending:  'bg-yellow-100 text-yellow-800',
  paid:     'bg-green-100 text-green-800',
  refunded: 'bg-gray-100 text-gray-600',
  failed:   'bg-red-100 text-red-800',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: 'specialty' | 'status' | 'payment' | 'default'
  type?: SpecialtyType | AppointmentStatus | PaymentStatus
  className?: string
}

export function Badge({ children, variant = 'default', type, className = '' }: BadgeProps) {
  let colorClass = 'bg-gray-100 text-gray-700'

  if (variant === 'specialty' && type) {
    colorClass = specialtyColors[type as SpecialtyType] ?? colorClass
  } else if (variant === 'status' && type) {
    colorClass = statusColors[type as AppointmentStatus] ?? colorClass
  } else if (variant === 'payment' && type) {
    colorClass = paymentColors[type as PaymentStatus] ?? colorClass
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}>
      {children}
    </span>
  )
}
