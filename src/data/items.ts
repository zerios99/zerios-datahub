import { prisma } from '@/db'
import { firecrawl } from '@/lib/firecrawl'
import { bulkImportSchema, extractSchema, importSchema } from '@/schemas/import'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'
import { authMiddleware } from '@/middlewares/auth'

export const scrapeUrlFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(importSchema)
  .handler(async ({ data, context }) => {
    const item = await prisma.savedItem.create({
      data: {
        url: data.url,
        userId: context!.session.user.id,
        status: 'PROCESSING',
      },
    })

    try {
      const result = await firecrawl.scrape(data.url, {
        formats: ['markdown', { type: 'json', schema: extractSchema }],
        location: {
          country: 'US',
          languages: ['en'],
        },
        onlyMainContent: true,
      })

      const jsonData = result.json as z.infer<typeof extractSchema>

      let publishedAt: Date | null = null
      if (jsonData.publishedAt) {
        const parsed = new Date(jsonData.publishedAt)
        if (!isNaN(parsed.getTime())) {
          publishedAt = parsed
        }
      }

      return await prisma.savedItem.update({
        where: { id: item.id },
        data: {
          title: result.metadata?.title || null,
          content: result.markdown || null,
          ogImage: result.metadata?.ogImage || null,
          author: jsonData.authors || null,
          publishedAt,
          status: 'COMPLETED',
        },
      })
    } catch {
      return await prisma.savedItem.update({
        where: { id: item.id },
        data: { status: 'FAILED' },
      })
    }
  })

export const mapUrlFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(bulkImportSchema)
  .handler(async ({ data }) => {
    const result = await firecrawl.map(data.url, {
      limit: 25,
      search: data.search || undefined,
      location: {
        country: 'US',
        languages: ['en'],
      },
    })

    return result.links
  })

export const bulkScrapeUrlsFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(
    z.object({
      urls: z.array(z.string().url()),
    }),
  )
  .handler(async ({ data, context }) => {
    const results = []

    for (let i = 0; i < data.urls.length; i++) {
      const url = data.urls[i]

      const item = await prisma.savedItem.create({
        data: {
          url: url,
          userId: context!.session.user.id,
          status: 'PENDING',
        },
      })

      try {
        const result = await firecrawl.scrape(url, {
          formats: ['markdown', { type: 'json', schema: extractSchema }],
          location: {
            country: 'US',
            languages: ['en'],
          },
          onlyMainContent: true,
        })

        const jsonData = result.json as z.infer<typeof extractSchema>

        let publishedAt: Date | null = null
        if (jsonData.publishedAt) {
          const parsed = new Date(jsonData.publishedAt)
          if (!isNaN(parsed.getTime())) {
            publishedAt = parsed
          }
        }

        const updatedItem = await prisma.savedItem.update({
          where: { id: item.id },
          data: {
            title: result.metadata?.title || null,
            content: result.markdown || null,
            ogImage: result.metadata?.ogImage || null,
            author: jsonData.authors || null,
            publishedAt,
            status: 'COMPLETED',
          },
        })

        results.push(updatedItem)
      } catch {
        const failedItem = await prisma.savedItem.update({
          where: { id: item.id },
          data: { status: 'FAILED' },
        })

        results.push(failedItem)
      }
    }

    return results
  })
