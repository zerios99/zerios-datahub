'use client'

import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Search,
  Sparkles,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const categories = [
  { id: 'ai', name: 'Artificial Intelligence', icon: Sparkles, count: 128 },
  { id: 'dev', name: 'Development', icon: BookOpen, count: 256 },
  { id: 'trending', name: 'Trending', icon: TrendingUp, count: 64 },
]

const featuredContent = [
  {
    id: 1,
    title: 'Getting Started with AI Agents',
    description: 'Learn how to build autonomous AI agents from scratch',
    category: 'ai',
    image:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    source: 'OpenAI Blog',
  },
  {
    id: 2,
    title: 'Modern Web Development in 2026',
    description: 'The complete guide to modern web technologies',
    category: 'dev',
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    source: 'Dev.to',
  },
  {
    id: 3,
    title: 'The Future of Machine Learning',
    description: 'Exploring the next frontier in ML research',
    category: 'ai',
    image:
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&h=400&fit=crop',
    source: 'Medium',
  },
  {
    id: 4,
    title: 'Building Scalable Systems',
    description: 'Best practices for distributed system architecture',
    category: 'dev',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
    source: 'AWS Blog',
  },
]

const trendingTopics = [
  'LLM Fine-tuning',
  'RAG Architecture',
  'Edge Computing',
  'WebAssembly',
  'Rust for Web',
  'Quantum Computing',
]

export const Route = createFileRoute('/dashboard/discover/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="flex flex-1 flex-col gap-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Discover</h1>
        <p className="text-muted-foreground">
          Explore trending content and discover new knowledge
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for topics, articles, or ideas..."
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Card
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                selectedCategory === category.id
                  ? 'border-primary bg-primary/5'
                  : ''
              }`}
              onClick={() =>
                setSelectedCategory(
                  selectedCategory === category.id ? null : category.id,
                )
              }
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <CardDescription>{category.count} items</CardDescription>
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Featured Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Featured</h2>
          <Button variant="ghost" size="sm" className="gap-1">
            View all <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {featuredContent.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden hover:shadow-lg transition-all"
            >
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.source}
                  </span>
                </div>
                <CardTitle className="line-clamp-1 text-lg">
                  {item.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  Save to collection <ExternalLink className="size-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Topics */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Trending Topics
        </h2>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) => (
            <Badge
              key={topic}
              variant="outline"
              className="cursor-pointer px-4 py-2 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              #{topic}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
