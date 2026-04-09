import Link from "next/link"
import Image from "next/image"
import { supabase, type BlogPost } from "@/lib/supabase"

const TOPIC_ICONS: Record<string, string> = {
  places:    "M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7Z M12 9m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0",
  health:    "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z",
  food:      "M18 8h1a4 4 0 0 1 0 8h-1 M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8Z M6 1v3 M10 1v3 M14 1v3",
  grooming:  "M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M6 9v12 M18 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M18 9v12 M6 15h12",
  training:  "M12 5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M8 21v-4a4 4 0 0 1 8 0v4",
  general:   "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z",
}

async function getPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, topic, slug, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })

  if (error) {
    console.error("blog_posts fetch error:", error.message)
    return []
  }
  return (data ?? []) as BlogPost[]
}

function TopicIcon({ topic }: { topic: string | null }) {
  const path = TOPIC_ICONS[topic ?? "general"] ?? TOPIC_ICONS.general
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {path.split(" M ").map((d, i) => (
        <path key={i} d={i === 0 ? d : "M " + d} />
      ))}
    </svg>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-SG", { month: "short", year: "numeric" })
}

function readTime(content: string) {
  const words = content?.split(/\s+/).length ?? 0
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

export const revalidate = 60

export default async function BlogIndex() {
  const posts = await getPosts()

  return (
    <div style={{ background: "var(--cream)", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{
        padding: "18px 24px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid var(--divider)",
        background: "var(--cream)",
      }}>
        <Link href="/" style={{
          display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
        }}>
          <Image src="/app-icon.png" alt="Sunday" width={32} height={32} style={{ borderRadius: 8 }} />
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 22, color: "var(--sageD)", letterSpacing: "-0.3px" }}>
            unday
          </span>
        </Link>
        <Link href="/" style={{ fontSize: 13, color: "var(--stone)", textDecoration: "none" }}>
          Download the app
        </Link>
      </nav>

      <main style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{
            fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 11,
            color: "var(--sageD)", letterSpacing: "0.1em",
            textTransform: "uppercase", marginBottom: 10,
          }}>
            From the Sunday team
          </p>
          <h1 style={{
            fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 36,
            color: "var(--ink)", lineHeight: 1.15, letterSpacing: "-0.5px",
          }}>
            The Sunday Edit
          </h1>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <p style={{ color: "var(--stone)", fontSize: 15 }}>No posts yet. Check back soon.</p>
        ) : (
          <div>
            {posts.map((post, i) => (
              <div key={post.id}>
                <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", display: "block" }}>
                  <article style={{ padding: "24px 0", cursor: "pointer" }}>
                    <span style={{
                      display: "flex", alignItems: "center", gap: 5,
                      fontWeight: 700, fontSize: 10,
                      color: "var(--sageD)", letterSpacing: "0.08em",
                      textTransform: "uppercase", marginBottom: 8,
                    }}>
                      <TopicIcon topic={post.topic} />
                      {post.topic ?? "General"}
                    </span>
                    <h2 style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: i === 0 ? 22 : 18,
                      color: "var(--ink)", lineHeight: 1.3,
                      letterSpacing: "-0.2px", marginBottom: 8,
                    }}>
                      {post.title}
                    </h2>
                    <p style={{ fontSize: 13, color: "var(--stone)" }}>
                      {readTime(post.content)} · {formatDate(post.published_at)}
                    </p>
                  </article>
                </Link>
                {i < posts.length - 1 && (
                  <div style={{ height: 1, background: "var(--divider)" }} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
