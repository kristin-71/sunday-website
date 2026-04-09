import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type BlogPost = {
  id: string
  title: string
  content: string
  topic: string | null
  slug: string
  status: string
  published_at: string
  created_at: string
}
