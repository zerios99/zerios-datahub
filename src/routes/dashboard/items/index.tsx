import { ItemStatus } from '@prisma/client'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Copy } from 'lucide-react'
import z from 'zod'
import { zodValidator } from '@tanstack/zod-adapter'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getItemsFn } from '@/data/items'
import { copyToClipboard } from '@/lib/clipboard'

const itemsSearchSchema = z.object({
  q: z.string().default(''),
  status: z.union([z.literal('all'), z.nativeEnum(ItemStatus)]).default('all'),
})

export const Route = createFileRoute('/dashboard/items/')({
  component: RouteComponent,
  loader: () => getItemsFn(),
  validateSearch: zodValidator(itemsSearchSchema),
})

function RouteComponent() {
  const data = Route.useLoaderData()

  const { status, q } = Route.useSearch()
  const [searchInput, setSearchInput] = useState(q)
  const navigate = useNavigate({ from: Route.fullPath })

  const filteredData = data.filter((item) => {
    const matchesStatus = status === 'all' || item.status === status
    const matchesSearch =
      !q ||
      item.title?.toLowerCase().includes(q.toLowerCase()) ||
      item.tags.some((tag) => tag.toLowerCase().includes(q.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  useEffect(() => {
    if (searchInput === q) return

    const timeOutId = setTimeout(() => {
      navigate({ search: (prev) => ({ ...prev, q: searchInput }) })
    }, 300)

    return () => clearTimeout(timeOutId)
  }, [searchInput, navigate, q])

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="">
        <h1 className="text-2xl text-bold"> Saved items </h1>
        <p className="text-muted-foreground">Your saved article and content!</p>
      </div>

      {/* search and filter controls */}
      <div className="flex gap-4">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="search by title or tags"
        />
        <Select
          value={status}
          onValueChange={(value) => {
            navigate({
              search: (prev) => ({
                ...prev,
                status: value as typeof status,
              }),
            })
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(ItemStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredData.map((item) => (
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
                  <Badge
                    variant={
                      item.status === 'COMPLETED' ? 'default' : 'secondary'
                    }
                  >
                    {item.status.toLocaleLowerCase()}
                  </Badge>
                  <Button
                    onClick={async (e) => {
                      e.preventDefault()
                      await copyToClipboard(item.url)
                    }}
                    variant={'outline'}
                    size={'icon'}
                    className="size-8"
                  >
                    <Copy className="size-4" />
                  </Button>
                </div>

                <CardTitle className="line-clamp-2 text-xl leading-snug group-hover:text-primary transition-colors">
                  {item.title ?? 'No Title'}
                </CardTitle>
                {item.author && (
                  <p className="text-xs text-muted-foreground">{item.author}</p>
                )}
              </CardHeader>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
