'use client'

import React, { useRef, useEffect, useCallback } from 'react'

export interface PopoverDropdownProps {
  isOpen: boolean
  onClose: () => void
  trigger: React.ReactNode
  children: React.ReactNode
  align?: 'left' | 'right'
  width?: string
  className?: string
}

export function PopoverDropdown({
  isOpen,
  onClose,
  trigger,
  children,
  align = 'right',
  width = '320px',
  className = '',
}: PopoverDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle outside click
  const handleOutsideClick = useCallback(
    (event: MouseEvent | PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    },
    [onClose]
  )

  // Handle ESC key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return

    // Defer listener registration to next macrotask to prevent the opening click
    // or pointerdown event from instantly triggering an outside click close
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handleOutsideClick)
      document.addEventListener('keydown', handleKeyDown)
    }, 10)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('pointerdown', handleOutsideClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleOutsideClick, handleKeyDown])

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {trigger}

      {isOpen && (
        <div
          role="region"
          className={`panel popover-dropdown ${className}`}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            [align]: 0,
            width: `min(${width}, calc(100vw - 24px))`,
            zIndex: 150,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.08)',
            animation: 'popoverFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
