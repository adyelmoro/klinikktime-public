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
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
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
