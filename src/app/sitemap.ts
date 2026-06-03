import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://klinikktime.vercel.app'

  const supabase = createServiceClient()
  const { data: practitioners } = await (supabase as any)
    .from('practitioners')
    .select('id, updated_at')
    .eq('is_active', true)

  const practitionerUrls = (practitioners ?? []).map((p: { id: string; updated_at: string }) => ({
    url: `${base}/practitioners/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/practitioners`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...practitionerUrls,
  ]
}
