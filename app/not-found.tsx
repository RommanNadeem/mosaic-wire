import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
          Page Not Found
        </h2>
        <p className="text-[var(--text-secondary)] mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-[var(--accent-positive)] text-white rounded hover:opacity-90 transition-opacity"
        >
          Go back home
        </Link>
      </div>
    </div>
  )
}

