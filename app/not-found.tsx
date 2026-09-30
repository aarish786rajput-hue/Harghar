import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center space-y-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-extrabold text-primary">404</h1>
        <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
      </div>
      <p className="text-muted-foreground max-w-md">
        Oops! The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 transition-opacity"
      >
        Return to HarGhar Home
      </Link>
    </div>
  )
}
