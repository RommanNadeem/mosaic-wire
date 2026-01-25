'use client'

import { useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
          Something went wrong!
        </h1>
        <p className="text-[var(--text-secondary)] mb-6">
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-[var(--accent-positive)] text-white rounded hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

