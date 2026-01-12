import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div>Hello "/about"!</div>
      <Link to="/">Home</Link>
    </>
  )
}
