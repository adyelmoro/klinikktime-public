'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { BankIDModal } from './BankIDModal'
import { useLanguage } from '@/i18n/context'

interface BankIDButtonProps {
  onSuccess: (userId: string, email: string, name: string) => void
  className?: string
}

export function BankIDButton({ onSuccess, className }: BankIDButtonProps) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="bankid"
        size="md"
        className={className}
        onClick={() => setOpen(true)}
      >
        {/* BankID geometric bar mark — matches official bankid.no logo mark */}
        <svg className="w-4 h-5" viewBox="0 0 33 21" fill="currentColor">
          <rect x="0"  y="0"  width="9" height="3" rx="1.5"/>
          <rect x="0"  y="12" width="9" height="3" rx="1.5"/>
          <rect x="0"  y="18" width="9" height="3" rx="1.5"/>
          <rect x="12" y="6"  width="9" height="3" rx="1.5"/>
          <rect x="12" y="12" width="9" height="3" rx="1.5"/>
          <rect x="24" y="0"  width="9" height="3" rx="1.5"/>
          <rect x="24" y="6"  width="9" height="3" rx="1.5"/>
          <rect x="24" y="18" width="9" height="3" rx="1.5"/>
        </svg>
        {t.bankid.button}
      </Button>

      {open && (
        <BankIDModal
          onSuccess={(userId, email, name) => {
            setOpen(false)
            onSuccess(userId, email, name)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
