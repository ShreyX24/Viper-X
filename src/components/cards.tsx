// src/components/Card.tsx
import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className = '' }: CardProps) => {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg p-6 ${className}`}>
      {children}
    </div>
  )
}