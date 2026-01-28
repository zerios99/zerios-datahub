import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { getItemsFn } from '@/data/items'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Copy } from 'lucide-react'

export const Route = createFileRoute('/dashboard/items/')({
  component: RouteComponent,
  loader: () => getItemsFn(),
})

function RouteComponent() {
  const data = Route.useLoaderData()

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {data.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden transition-all hover:shadow-lg pt-0"
        >
          <Link to={'/dashboard'} className="block">
            {item.ogImage && (
              <div className="aspect-video w-full overflow-hidden bg-muted">
                <img
                  src={item.ogImage}
                  alt={item.title ?? 'No title'}
                  className="h-full w-full object-cover
                  group-hover:scale-105
                  "
                />
              </div>
            )}

            <CardHeader className="space-y-3 pt-4">
              <div className="flex items-center justify-between gap-2">
                <span>{item.status.toLocaleLowerCase()}</span>
                <Button variant={'outline'} size={'icon'} className="size-8">
                  <Copy className="size-4" />
                </Button>
              </div>
            </CardHeader>
          </Link>
        </Card>
      ))}
    </div>
  )
}
