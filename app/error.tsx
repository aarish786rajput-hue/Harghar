'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 px-4 text-center">
      <h2 className="text-2xl font-bold text-destructive">Something went wrong!</h2>
      <p className="text-muted-foreground">We apologize for the inconvenience.</p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        variant="outline"
      >
        Try again
      </Button>
    </div>
  )
}
