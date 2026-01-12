import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <>
      <div>hello</div>
      <Link to="/about">About</Link>
    </>
  )
}
