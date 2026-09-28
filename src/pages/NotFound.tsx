import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="section flex min-h-screen flex-col items-center justify-center bg-bg text-center"
    >
      <p className="eyebrow eyebrow-center mb-6">404</p>
      <h1 className="text-6xl font-extrabold tracking-[-0.03em] text-text-primary md:text-7xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base text-muted">
        The page you're looking for doesn't exist. Let's get you back home.
      </p>
      <Link to="/" className="pill pill-primary mt-10 px-8 py-3.5 text-sm">
        Back to home
      </Link>
    </main>
  )
}